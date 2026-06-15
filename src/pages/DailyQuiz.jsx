import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { QuizQuestion } from "../components/quiz/QuizQuestion";
import { QuizResults } from "../components/quiz/QuizResults";
import { useAuth } from "../context/AuthContext";
import { quizService } from "../services/quizService";
import { formatDisplayDate } from "../utils/date";

export function DailyQuiz() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setGenerating(true);
        const [todayQuiz, todayAttempt] = await Promise.all([
          quizService.getOrCreateTodayQuiz(user.uid, user.email),
          quizService.getTodayAttempt(user.uid),
        ]);
        setQuiz(todayQuiz);
        if (todayAttempt) {
          setAttempt(todayAttempt);
          setSubmitted(true);
        }
      } catch (err) {
        setError(err.message || "Failed to load today's quiz.");
      } finally {
        setLoading(false);
        setGenerating(false);
      }
    }
    load();
  }, [user.uid, user.email]);

  const handleSelect = (option) => {
    if (submitted) return;
    const q = quiz.questions[currentIdx];
    setAnswers((prev) => ({ ...prev, [q.id]: option }));
  };

  const handleSubmit = async () => {
    const unanswered = quiz.questions.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      setError(`Please answer all questions. ${unanswered.length} remaining.`);
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const result = await quizService.submitAttempt(user.uid, quiz, answers);
      setAttempt(result);
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
        <p className="text-sm font-black text-slate-500 uppercase tracking-widest">
          {generating ? "Generating today's quiz..." : "Loading..."}
        </p>
      </div>
    );
  }

  if (error && !quiz) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center space-y-6">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-2xl font-black text-white">Quiz Unavailable</h2>
        <p className="text-slate-500">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  if (submitted && attempt) {
    return (
      <QuizResults
        attempt={attempt}
        onViewHistory={() => navigate("/history")}
        onGoDashboard={() => navigate("/")}
      />
    );
  }

  const currentQuestion = quiz.questions[currentIdx];
  const progress = ((currentIdx + 1) / quiz.questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">
              Daily Quiz
            </span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">{quiz.topic}</h1>
          <p className="text-slate-500 text-sm mt-1">{formatDisplayDate(quiz.date)}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-white">
            {currentIdx + 1}
            <span className="text-slate-600 text-lg">/{quiz.questions.length}</span>
          </p>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            {answeredCount} answered
          </p>
        </div>
      </div>

      <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <Card className="p-8 bg-slate-900 border-slate-800">
        <QuizQuestion
          question={currentQuestion}
          index={currentIdx}
          selected={answers[currentQuestion.id]}
          onSelect={handleSelect}
        />
      </Card>

      {error && (
        <p className="text-sm text-red-400 text-center font-medium">{error}</p>
      )}

      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          className="border-slate-800 text-slate-400 gap-2"
          disabled={currentIdx === 0}
          onClick={() => setCurrentIdx((i) => i - 1)}
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </Button>

        {currentIdx < quiz.questions.length - 1 ? (
          <Button
            className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 border-0"
            disabled={!answers[currentQuestion.id]}
            onClick={() => setCurrentIdx((i) => i + 1)}
          >
            Next <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 border-0"
            disabled={submitting || answeredCount < quiz.questions.length}
            onClick={handleSubmit}
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            Submit Quiz
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {quiz.questions.map((q, idx) => (
          <button
            key={q.id}
            onClick={() => setCurrentIdx(idx)}
            className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${
              idx === currentIdx
                ? "bg-purple-500 text-white"
                : answers[q.id]
                ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                : "bg-slate-900 text-slate-600 border border-slate-800"
            }`}
          >
            {idx + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
