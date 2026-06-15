import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles,
  Flame,
  Brain,
  Calendar,
  ChevronRight,
  Loader2,
  Target,
  TrendingUp,
  TrendingDown,
  Trophy,
  CheckCircle2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { StudyHeatmap } from "../stats/StudyHeatmap";
import { quizService } from "../../services/quizService";
import { useAuth } from "../../context/AuthContext";
import { formatDisplayDate } from "../../utils/date";

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [todayAttempt, setTodayAttempt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [dashboardStats, attempt] = await Promise.all([
          quizService.getDashboardStats(user.uid),
          quizService.getTodayAttempt(user.uid),
        ]);
        setStats(dashboardStats);
        setTodayAttempt(attempt);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user.uid]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  const recentAttempts = stats.attempts.slice(0, 3);
  const todayCompleted = !!todayAttempt;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-12"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            Hi, {user.displayName?.split(" ")[0] || "Scholar"}!
          </h1>
          <p className="text-slate-400 mt-2 text-lg">
            {todayCompleted
              ? "Great job completing today's quiz!"
              : "Your daily quiz is waiting for you."}
          </p>
        </div>
        <Button
          size="lg"
          className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 border-0 h-12 px-8"
          onClick={() => navigate("/quiz")}
        >
          {todayCompleted ? (
            <>
              <CheckCircle2 className="w-5 h-5" /> Review Today's Quiz
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" /> Take Today's Quiz
            </>
          )}
        </Button>
      </motion.div>

      {/* Primary Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-slate-900 border-slate-800 hover:-translate-y-1 transition-all group">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
              <Brain className="w-8 h-8 text-purple-500" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Knowledge Score</p>
              <p className="text-3xl font-black text-white">{stats.knowledgeScore}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-slate-900 border-slate-800 hover:-translate-y-1 transition-all group">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
              <Flame className="w-8 h-8 text-orange-500" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Quiz Streak</p>
              <p className="text-3xl font-black text-white">{stats.streak} Days</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-slate-900 border-slate-800 hover:-translate-y-1 transition-all group">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
              <Target className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Weekly Accuracy</p>
              <p className="text-3xl font-black text-white">{stats.weeklyAccuracy}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-slate-900 border-slate-800 hover:-translate-y-1 transition-all group">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
              <Trophy className="w-8 h-8 text-indigo-500" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Quizzes Completed</p>
              <p className="text-3xl font-black text-white">{stats.quizzesCompleted}</p>
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Heatmap */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="h-full bg-slate-900 border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <Calendar className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Quiz Completion Heatmap</h3>
                <p className="text-xs text-slate-500 mt-0.5 uppercase tracking-widest font-bold">
                  Daily consistency tracker
                </p>
              </div>
            </div>
            <StudyHeatmap activity={stats.activity} label="quizzes" />
          </Card>
        </motion.div>

        {/* Recent Quizzes */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card className="h-full bg-slate-900 border-slate-800 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-white">Recent Quizzes</h3>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-500 hover:text-white"
                onClick={() => navigate("/history")}
              >
                View All
              </Button>
            </div>
            <div className="space-y-4 flex-grow">
              {recentAttempts.length > 0 ? (
                recentAttempts.map((attempt) => (
                  <button
                    key={attempt.id}
                    onClick={() => navigate(`/history/${attempt.id}`)}
                    className="w-full text-left group p-4 rounded-2xl border border-slate-800 bg-slate-950/50 hover:bg-slate-800 hover:border-slate-700 transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-slate-200 line-clamp-1 group-hover:text-white transition-colors">
                        {attempt.topic}
                      </h4>
                      <span
                        className={`text-sm font-black ${
                          attempt.percentage >= 80
                            ? "text-green-400"
                            : attempt.percentage >= 60
                            ? "text-yellow-400"
                            : "text-red-400"
                        }`}
                      >
                        {attempt.percentage}%
                      </span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                      {formatDisplayDate(attempt.date)}
                    </p>
                  </button>
                ))
              ) : (
                <div className="py-12 text-center">
                  <p className="text-sm text-slate-500 italic font-medium">No quizzes completed yet.</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Strong & Weak Topics */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 bg-slate-900 border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-bold text-white">Strong Topics</h3>
          </div>
          {stats.strongTopics.length > 0 ? (
            <div className="space-y-3">
              {stats.strongTopics.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800"
                >
                  <span className="font-bold text-slate-200 text-sm">{t.topic}</span>
                  <span className="text-green-400 font-black text-sm">{t.accuracy}%</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Complete more quizzes to identify strong topics.</p>
          )}
        </Card>

        <Card className="p-6 bg-slate-900 border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <TrendingDown className="w-5 h-5 text-red-400" />
            <h3 className="text-lg font-bold text-white">Weak Topics</h3>
          </div>
          {stats.weakTopics.length > 0 ? (
            <div className="space-y-3">
              {stats.weakTopics.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800"
                >
                  <span className="font-bold text-slate-200 text-sm">{t.topic}</span>
                  <span className="text-red-400 font-black text-sm">{t.accuracy}%</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Complete more quizzes to identify areas to improve.</p>
          )}
        </Card>
      </motion.div>

      {/* Accuracy Trend */}
      <motion.div variants={itemVariants}>
        <Card className="p-6 bg-slate-900 border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Accuracy Trend</h3>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-black">Last 14 days</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.accuracyTrend}>
                <XAxis
                  dataKey="label"
                  stroke="#475569"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value, idx) => (idx % 2 === 0 ? value : "")}
                />
                <YAxis
                  stroke="#475569"
                  fontSize={10}
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
                  formatter={(value) => [value != null ? `${value}%` : "No quiz", "Accuracy"]}
                />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#a855f7"
                  strokeWidth={2}
                  dot={{ fill: "#a855f7", r: 4 }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>

      {/* Quick links */}
      <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
        <Button
          variant="outline"
          className="border-slate-800 text-slate-300 gap-2"
          onClick={() => navigate("/topics")}
        >
          Topic Mastery <ChevronRight className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          className="border-slate-800 text-slate-300 gap-2"
          onClick={() => navigate("/settings")}
        >
          Settings <ChevronRight className="w-4 h-4" />
        </Button>
      </motion.div>
    </motion.div>
  );
}
