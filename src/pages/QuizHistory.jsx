import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { History, ChevronRight, Loader2, Trophy, Calendar } from "lucide-react";
import { Card } from "../components/ui/Card";
import { useAuth } from "../context/AuthContext";
import { quizService } from "../services/quizService";
import { formatDisplayDate } from "../utils/date";

export function QuizHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await quizService.getAttempts(user.uid);
      setAttempts(data);
      setLoading(false);
    }
    load();
  }, [user.uid]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-purple-500/10 rounded-xl border border-purple-500/20">
          <History className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Quiz History</h1>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-black">
            {attempts.length} attempts recorded
          </p>
        </div>
      </div>

      {attempts.length === 0 ? (
        <Card className="p-12 bg-slate-900 border-slate-800 text-center">
          <Trophy className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">No quiz attempts yet. Take today's quiz to get started!</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {attempts.map((attempt, idx) => (
            <motion.div
              key={attempt.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <button
                onClick={() => navigate(`/history/${attempt.id}`)}
                className="w-full text-left group"
              >
                <Card className="p-5 bg-slate-900 border-slate-800 hover:border-purple-500/30 hover:bg-slate-800/50 transition-all">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-grow min-w-0">
                      <h3 className="font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                        {attempt.topic}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" />
                          {formatDisplayDate(attempt.date)}
                        </span>
                        <span>
                          {attempt.score}/{attempt.totalQuestions} correct
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right">
                        <p
                          className={`text-2xl font-black ${
                            attempt.percentage >= 80
                              ? "text-green-400"
                              : attempt.percentage >= 60
                              ? "text-yellow-400"
                              : "text-red-400"
                          }`}
                        >
                          {attempt.percentage}%
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-purple-400 transition-colors" />
                    </div>
                  </div>
                </Card>
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
