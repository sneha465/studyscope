import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  Timestamp,
  serverTimestamp,
  limit,
  orderBy,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { aiService, DEFAULT_TOPICS } from "./aiService";
import { toISODate, getYesterdayISO, slugifyTopic } from "../utils/date";

const QUESTIONS_PER_QUIZ = 10;

function getMasteryLevel(accuracy, totalCount) {
  if (totalCount < 3) return "Beginner";
  if (accuracy >= 80) return "Advanced";
  if (accuracy >= 60) return "Intermediate";
  return "Beginner";
}

function pickTopicForDate(preferredTopics, dateStr) {
  const topics =
    preferredTopics?.length > 0 ? preferredTopics : DEFAULT_TOPICS;
  const dayIndex = dateStr.split("-").reduce((acc, n) => acc + parseInt(n, 10), 0);
  return topics[dayIndex % topics.length];
}

export const quizService = {
  ensureUserDoc: async (userId, email, displayName) => {
    if (!userId) return;
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      await setDoc(userRef, {
        createdAt: Timestamp.now(),
        streak: 0,
        totalQuizzesCompleted: 0,
        knowledgeScore: 0,
        lastQuizDate: null,
        activity: {},
        preferredTopics: DEFAULT_TOPICS,
        emailReminders: true,
        email: email || null,
        displayName: displayName || null,
      });
    } else {
      const updates = {};
      if (email) updates.email = email;
      if (displayName) updates.displayName = displayName;
      if (Object.keys(updates).length > 0) {
        await updateDoc(userRef, updates);
      }
    }
  },

  getUserProfile: async (userId) => {
    if (!userId) return null;
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
  },

  updateUserSettings: async (userId, settings) => {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, settings);
  },

  getTodayQuiz: async (userId) => {
    const today = toISODate();
    const q = query(
      collection(db, "dailyQuizzes"),
      where("userId", "==", userId),
      where("date", "==", today),
      limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...d.data() };
  },

  getOrCreateTodayQuiz: async (userId, userEmail) => {
    await quizService.ensureUserDoc(userId, userEmail);
    const existing = await quizService.getTodayQuiz(userId);
    if (existing) return existing;

    const profile = await quizService.getUserProfile(userId);
    const today = toISODate();
    const topic = pickTopicForDate(profile?.preferredTopics, today);

    const generated = await aiService.generateDailyQuiz(topic);

    const quizData = {
      userId,
      date: today,
      topic: generated.topic || topic,
      questions: generated.questions,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "dailyQuizzes"), quizData);
    return { id: docRef.id, ...quizData, createdAt: Timestamp.now() };
  },

  getQuizById: async (quizId) => {
    const quizRef = doc(db, "dailyQuizzes", quizId);
    const quizDoc = await getDoc(quizRef);
    if (!quizDoc.exists()) return null;
    return { id: quizDoc.id, ...quizDoc.data() };
  },

  getAttemptForQuiz: async (userId, quizId) => {
    const q = query(
      collection(db, "quizAttempts"),
      where("userId", "==", userId),
      where("quizId", "==", quizId),
      limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...d.data() };
  },

  getTodayAttempt: async (userId) => {
    const today = toISODate();
    const q = query(
      collection(db, "quizAttempts"),
      where("userId", "==", userId),
      where("date", "==", today),
      limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...d.data() };
  },

  submitAttempt: async (userId, quiz, selectedAnswers) => {
    const existing = await quizService.getAttemptForQuiz(userId, quiz.id);
    if (existing) {
      throw new Error("You have already completed today's quiz.");
    }

    const answers = quiz.questions.map((q) => {
      const selected = selectedAnswers[q.id] || null;
      return {
        questionId: q.id,
        question: q.question,
        selected,
        correct_answer: q.correct_answer,
        isCorrect: selected === q.correct_answer,
        explanation: q.explanation,
        topic: q.topic,
        difficulty: q.difficulty,
        options: q.options,
      };
    });

    const score = answers.filter((a) => a.isCorrect).length;
    const percentage = Math.round((score / QUESTIONS_PER_QUIZ) * 100);

    const attemptData = {
      userId,
      quizId: quiz.id,
      date: quiz.date,
      topic: quiz.topic,
      score,
      totalQuestions: QUESTIONS_PER_QUIZ,
      percentage,
      answers,
      completedAt: serverTimestamp(),
    };

    const attemptRef = await addDoc(collection(db, "quizAttempts"), attemptData);

    await quizService.updateStreak(userId);
    await quizService.updateTopicMastery(userId, answers);
    await quizService.updateKnowledgeScore(userId);

    return { id: attemptRef.id, ...attemptData, completedAt: Timestamp.now() };
  },

  updateStreak: async (userId) => {
    const userRef = doc(db, "users", userId);
    const today = toISODate();
    const yesterday = getYesterdayISO();

    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      await setDoc(userRef, {
        streak: 1,
        totalQuizzesCompleted: 1,
        lastQuizDate: today,
        activity: { [today]: 1 },
        knowledgeScore: 0,
        preferredTopics: DEFAULT_TOPICS,
        emailReminders: true,
        createdAt: Timestamp.now(),
      });
      return;
    }

    const data = userDoc.data();
    const lastDate = data.lastQuizDate;
    let newStreak = data.streak || 0;

    if (lastDate !== today) {
      newStreak = lastDate === yesterday ? newStreak + 1 : 1;
    }

    await updateDoc(userRef, {
      lastQuizDate: today,
      streak: newStreak,
      totalQuizzesCompleted: increment(1),
      [`activity.${today}`]: increment(1),
    });
  },

  updateTopicMastery: async (userId, answers) => {
    const byTopic = {};
    answers.forEach((a) => {
      if (!byTopic[a.topic]) byTopic[a.topic] = { correct: 0, total: 0 };
      byTopic[a.topic].total += 1;
      if (a.isCorrect) byTopic[a.topic].correct += 1;
    });

    for (const [topic, stats] of Object.entries(byTopic)) {
      const slug = slugifyTopic(topic);
      const masteryRef = doc(db, "users", userId, "topicMastery", slug);
      const masteryDoc = await getDoc(masteryRef);

      if (!masteryDoc.exists()) {
        const accuracy = Math.round((stats.correct / stats.total) * 100);
        await setDoc(masteryRef, {
          topic,
          correctCount: stats.correct,
          totalCount: stats.total,
          accuracy,
          masteryLevel: getMasteryLevel(accuracy, stats.total),
          history: [{ date: toISODate(), correct: stats.correct, total: stats.total, accuracy }],
          updatedAt: serverTimestamp(),
        });
      } else {
        const prev = masteryDoc.data();
        const correctCount = (prev.correctCount || 0) + stats.correct;
        const totalCount = (prev.totalCount || 0) + stats.total;
        const accuracy = Math.round((correctCount / totalCount) * 100);
        const history = [
          ...(prev.history || []),
          { date: toISODate(), correct: stats.correct, total: stats.total, accuracy: Math.round((stats.correct / stats.total) * 100) },
        ].slice(-30);

        await updateDoc(masteryRef, {
          correctCount,
          totalCount,
          accuracy,
          masteryLevel: getMasteryLevel(accuracy, totalCount),
          history,
          updatedAt: serverTimestamp(),
        });
      }
    }
  },

  updateKnowledgeScore: async (userId) => {
    const attempts = await quizService.getAttempts(userId, 30);
    if (attempts.length === 0) return;
    const avg = Math.round(
      attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length
    );
    await updateDoc(doc(db, "users", userId), { knowledgeScore: avg });
  },

  getAttempts: async (userId, maxCount = 50) => {
    if (!userId) return [];
    try {
      const q = query(
        collection(db, "quizAttempts"),
        where("userId", "==", userId),
        orderBy("completedAt", "desc"),
        limit(maxCount)
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          completedAt: data.completedAt?.toDate?.() || null,
        };
      });
    } catch {
      const q = query(
        collection(db, "quizAttempts"),
        where("userId", "==", userId),
        limit(maxCount)
      );
      const snap = await getDocs(q);
      return snap.docs
        .map((d) => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
            completedAt: data.completedAt?.toDate?.() || null,
          };
        })
        .sort((a, b) => (b.completedAt?.getTime?.() || 0) - (a.completedAt?.getTime?.() || 0));
    }
  },

  getAttemptById: async (attemptId) => {
    const attemptRef = doc(db, "quizAttempts", attemptId);
    const attemptDoc = await getDoc(attemptRef);
    if (!attemptDoc.exists()) return null;
    const data = attemptDoc.data();
    return {
      id: attemptDoc.id,
      ...data,
      completedAt: data.completedAt?.toDate?.() || null,
    };
  },

  getTopicMastery: async (userId) => {
    if (!userId) return [];
    const snap = await getDocs(collection(db, "users", userId, "topicMastery"));
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.accuracy || 0) - (a.accuracy || 0));
  },

  getDashboardStats: async (userId) => {
    const [profile, attempts, mastery] = await Promise.all([
      quizService.getUserProfile(userId),
      quizService.getAttempts(userId, 50),
      quizService.getTopicMastery(userId),
    ]);

    const now = new Date();
    const weekAttempts = attempts.filter((a) => {
      if (!a.completedAt) return false;
      const diff = (now - a.completedAt) / (1000 * 60 * 60 * 24);
      return diff <= 7;
    });
    const weeklyAccuracy =
      weekAttempts.length > 0
        ? Math.round(weekAttempts.reduce((s, a) => s + a.percentage, 0) / weekAttempts.length)
        : 0;

    const qualified = mastery.filter((m) => (m.totalCount || 0) >= 3);
    const strongTopics = [...qualified].sort((a, b) => b.accuracy - a.accuracy).slice(0, 3);
    const weakTopics = [...qualified].sort((a, b) => a.accuracy - b.accuracy).slice(0, 3);

    const accuracyTrend = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = toISODate(d);
      const dayAttempts = attempts.filter((a) => a.date === dateStr);
      const avg =
        dayAttempts.length > 0
          ? Math.round(dayAttempts.reduce((s, a) => s + a.percentage, 0) / dayAttempts.length)
          : null;
      accuracyTrend.push({
        date: dateStr,
        label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        accuracy: avg,
      });
    }

    return {
      profile,
      attempts,
      mastery,
      knowledgeScore: profile?.knowledgeScore || 0,
      streak: profile?.streak || 0,
      weeklyAccuracy,
      quizzesCompleted: profile?.totalQuizzesCompleted || attempts.length,
      activity: profile?.activity || {},
      strongTopics,
      weakTopics,
      accuracyTrend,
    };
  },
};
