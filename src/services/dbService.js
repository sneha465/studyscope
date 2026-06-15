import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  Timestamp,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../lib/firebase";

export const dbService = {
  /**
   * Ensures the user document exists in Firestore
   */
  ensureUserDoc: async (userId) => {
    if (!userId) return;
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      await setDoc(userRef, {
        createdAt: Timestamp.now(),
        streak: 0,
        totalSessions: 0,
        activity: {}
      }, { merge: true });
    }
  },

  /**
   * Saves a completed study session
   */


  /**
   * Fetches user's study sessions
   */
  getSessions: async (userId) => {
    if (!userId) return [];

    try {
      const sessionsRef = collection(db, "sessions");

      const q = query(
        sessionsRef,
        where("userId", "==", userId),
        limit(50)
      );

      const querySnapshot = await getDocs(q);

      const sessions = querySnapshot.docs.map(doc => {
        const data = doc.data();
        let date = "Unknown";

        if (data.completedAt?.seconds) {
          date = new Date(data.completedAt.seconds * 1000).toLocaleDateString();
        } else if (data.completedAt) {
          date = new Date(data.completedAt).toLocaleDateString();
        } else if (data.startedAt?.seconds) {
          date = new Date(data.startedAt.seconds * 1000).toLocaleDateString();
        }

        return {
          id: doc.id,
          ...data,
          date
        };
      });

      return sessions.sort((a, b) => {
        return (b.completedAt?.seconds || 0) - (a.completedAt?.seconds || 0);
      });

    } catch (error) {
      console.error("Error fetching sessions:", error);
      return [];
    }
  },

  /**
   * Fetches a single study session by ID
   */
  getSession: async (sessionId) => {
    if (!sessionId) return null;

    try {
      const sessionRef = doc(db, "sessions", sessionId);
      const sessionDoc = await getDoc(sessionRef);

      if (!sessionDoc.exists()) return null;

      const data = sessionDoc.data();
      let date = "Unknown";

      if (data.completedAt?.seconds) {
        date = new Date(data.completedAt.seconds * 1000).toLocaleDateString();
      } else if (data.completedAt) {
        date = new Date(data.completedAt).toLocaleDateString();
      } else if (data.startedAt?.seconds) {
        date = new Date(data.startedAt.seconds * 1000).toLocaleDateString();
      }

      return {
        id: sessionDoc.id,
        ...data,
        date
      };
    } catch (error) {
      console.error("Error fetching session:", error);
      return null;
    }
  },

  /**
   * Updates user study streak and heatmap data
   */
  updateStreak: async (userId) => {
    if (!userId) return;
    const userRef = doc(db, "users", userId);
    const today = new Date().toISOString().split('T')[0];

    try {
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          lastStudyDate: today,
          streak: 1,
          totalSessions: 1,
          activity: { [today]: 1 }
        });
        return;
      }

      const data = userDoc.data();
      const lastDate = data.lastStudyDate;

      let newStreak = data.streak || 0;
      if (lastDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastDate === yesterdayStr) {
          newStreak += 1;
        } else {
          newStreak = 1;
        }
      }

      await updateDoc(userRef, {
        lastStudyDate: today,
        streak: newStreak,
        totalSessions: increment(1),
        [`activity.${today}`]: increment(1)
      });
    } catch (error) {
      console.error("Error updating streak:", error);
    }
  },

  /**
   * Gets user profile including streak and activity
   */
  getUserStats: async (userId) => {
    if (!userId) return null;
    try {
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);
      return userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
      console.error("Error getting user stats:", error);
      return null;
    }
  },

  /**
   * Saves a detailed study session with phases information
   */
  saveStudySession: async (userId, sessionData) => {
    if (!userId) throw new Error("User ID is required");
    try {
      await dbService.ensureUserDoc(userId);
      const sessionsRef = collection(db, "sessions");
      const session = {
        userId,
        topic: sessionData.topic,
        totalDuration: Number(sessionData.totalDuration) || 0,
        phasesCompleted: sessionData.phasesCompleted || 0,
        startedAt: Timestamp.fromDate(new Date(sessionData.startedAt)),
        completedAt: serverTimestamp()
      };
      const docRef = await addDoc(sessionsRef, session);
      await dbService.updateStreak(userId);
      return { id: docRef.id, ...session };
    } catch (error) {
      console.error("Error saving study session:", error);
      throw error;
    }
  },

  /**
   * Saves feedback for a specific resource
   */
  saveResourceFeedback: async (userId, resourceUrl, feedback) => {
    if (!userId) throw new Error("User ID is required");
    try {
      const feedbackRef = collection(db, "users", userId, "resourceFeedback");
      await addDoc(feedbackRef, {
        resourceUrl,
        feedback, // 'useful' or 'not_useful'
        timestamp: Timestamp.now()
      });
    } catch (error) {
      console.error("Error saving resource feedback:", error);
      throw error;
    }
  }
};
