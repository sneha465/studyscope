import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  TrendingUp,
  Loader2,
  Target,
  Award,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card } from "../components/ui/Card";
import { useAuth } from "../context/AuthContext";
import { quizService } from "../services/quizService";

const LEVEL_COLORS = {
  Beginner: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  Intermediate: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  Advanced: "text-green-400 bg-green-500/10 border-green-500/20",
};

export function TopicMastery() {
  const { user } = useAuth();
  const [mastery, setMastery] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await quizService.getTopicMastery(user.uid);
      setMastery(data);
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
        <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
          <Brain className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Topic Mastery</h1>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-black">
            Track your knowledge across topics
          </p>
        </div>
      </div>

      {mastery.length === 0 ? (
        <Card className="p-12 bg-slate-900 border-slate-800 text-center">
          <Target className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">
            Complete daily quizzes to build your topic mastery profile.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {mastery.map((topic, idx) => (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="p-6 bg-slate-900 border-slate-800 h-full">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{topic.topic}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {topic.correctCount}/{topic.totalCount} correct
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded border ${
                      LEVEL_COLORS[topic.masteryLevel] || LEVEL_COLORS.Beginner
                    }`}
                  >
                    {topic.masteryLevel}
                  </span>
                </div>

                <div className="flex items-end gap-3 mb-6">
                  <p className="text-4xl font-black text-white">{topic.accuracy}%</p>
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest pb-1">
                    Accuracy
                  </p>
                </div>

                <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800 mb-6">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all"
                    style={{ width: `${topic.accuracy}%` }}
                  />
                </div>

                {topic.history?.length > 1 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="w-4 h-4 text-purple-400" />
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        Progress Over Time
                      </p>
                    </div>
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={topic.history.map((h) => ({
                            date: h.date?.slice(5),
                            accuracy: h.accuracy,
                          }))}
                        >
                          <XAxis
                            dataKey="date"
                            stroke="#475569"
                            fontSize={9}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis
                            stroke="#475569"
                            fontSize={9}
                            tickLine={false}
                            axisLine={false}
                            domain={[0, 100]}
                            unit="%"
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#0f172a",
                              borderColor: "#1e293b",
                              borderRadius: "12px",
                              fontSize: "11px",
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="accuracy"
                            stroke="#a855f7"
                            strokeWidth={2}
                            dot={{ fill: "#a855f7", r: 3 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {topic.masteryLevel === "Advanced" && (
                  <div className="mt-4 flex items-center gap-2 text-green-400">
                    <Award className="w-4 h-4" />
                    <span className="text-xs font-bold">Mastery achieved!</span>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
