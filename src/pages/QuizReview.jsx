import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, ChevronLeft } from "lucide-react";
import { Button } from "../components/ui/Button";
import { QuizResults } from "../components/quiz/QuizResults";
import { quizService } from "../services/quizService";

export function QuizReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await quizService.getAttemptById(id);
      setAttempt(data);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-black text-white">Attempt not found</h2>
        <Button className="mt-6" onClick={() => navigate("/history")}>
          Back to History
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Button
        variant="ghost"
        className="mb-6 text-slate-400 hover:text-white gap-2"
        onClick={() => navigate("/history")}
      >
        <ChevronLeft className="w-4 h-4" /> Back to History
      </Button>
      <QuizResults
        attempt={attempt}
        onViewHistory={() => navigate("/history")}
        onGoDashboard={() => navigate("/")}
      />
    </div>
  );
}
