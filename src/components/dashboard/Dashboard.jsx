import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Flame, Clock, Calendar, ChevronRight, LayoutGrid, List, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Card, CardHeader } from "../ui/Card";
import { Button } from "../ui/Button";
import { StudyHeatmap } from "../stats/StudyHeatmap";
import { dbService } from "../../services/dbService";
import { useAuth } from "../../context/AuthContext";

export function Dashboard({ onNewSession, onViewHistory }) {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [userStats, sessions] = await Promise.all([
          dbService.getUserStats(user.uid),
          dbService.getSessions(user.uid)
        ]);
        setStats(userStats);
        setSessions(sessions);
        setRecentSessions(sessions.slice(0, 3));
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

  const totalSessions = sessions.length;
  const totalStudyTime = sessions.reduce((acc, s) => acc + (parseInt(s.totalDuration) || 0), 0);
  const avgSessionDuration = totalSessions > 0 ? Math.round(totalStudyTime / totalSessions) : 0;
  const longestSession = sessions.reduce((max, s) => Math.max(max, parseInt(s.totalDuration) || 0), 0);
  const streak = stats?.streak || 0;

  // Most Studied Topic calculation
  const topicCounts = {};
  sessions.forEach(s => {
    if (s.topic) {
      topicCounts[s.topic] = (topicCounts[s.topic] || 0) + 1;
    }
  });
  let mostStudiedTopic = "None";
  let maxCount = 0;
  Object.entries(topicCounts).forEach(([topic, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostStudiedTopic = topic;
    }
  });

  // Last 7 days study data
  const weeklyChartData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString();
    const dayName = d.toLocaleDateString(undefined, { weekday: 'short' });
    weeklyChartData.push({ dateStr, dayName, duration: 0 });
  }
  sessions.forEach(s => {
    const sDate = s.date;
    const match = weeklyChartData.find(day => day.dateStr === sDate);
    if (match) {
      match.duration += (parseInt(s.totalDuration) || 0);
    }
  });

  // Last 30 days study data
  const monthlyChartData = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString();
    const dayLabel = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    monthlyChartData.push({ dateStr, label: dayLabel, duration: 0 });
  }
  sessions.forEach(s => {
    const sDate = s.date;
    const match = monthlyChartData.find(day => day.dateStr === sDate);
    if (match) {
      match.duration += (parseInt(s.totalDuration) || 0);
    }
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4 }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-12"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            Hi, {user.displayName?.split(" ")[0] || "Scholar"}! 👋
          </h1>
          <p className="text-slate-400 mt-2 text-lg">
            Ready for another productive study session?
          </p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-slate-900 border-slate-800 hover:-translate-y-1 transition-all group">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
              <Flame className="w-8 h-8 text-orange-500" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Streak</p>
              <p className="text-3xl font-black text-white">{stats?.streak || 0} Days</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-slate-900 border-slate-800 hover:-translate-y-1 transition-all group">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Total Time</p>
              <p className="text-3xl font-black text-white">
                {sessions.reduce((acc, s) => acc + (parseInt(s.totalDuration) || 0), 0)}<span className="text-sm font-bold text-slate-500">m</span>
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-slate-900 border-slate-800 hover:-translate-y-1 transition-all group">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
              <Calendar className="w-8 h-8 text-purple-500" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Sessions</p>
              <p className="text-3xl font-black text-white">{stats?.totalSessions || sessions.length}</p>
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Heatmap Section */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="h-full bg-slate-900 border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <List className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Study Activity</h3>
                <p className="text-xs text-slate-500 mt-0.5 uppercase tracking-widest font-bold">Persistence Tracker</p>
              </div>
            </div>
            <div className="mt-4">
              <StudyHeatmap activity={stats?.activity || {}} />
            </div>
          </Card>
        </motion.div>

        {/* Recent Sessions */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card className="h-full bg-slate-900 border-slate-800 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Clock className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Recent</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-500 hover:text-white"
                onClick={onViewHistory}
              >
                View All
              </Button>
            </div>

            <div className="space-y-4 flex-grow">
              {recentSessions.length > 0 ? (
                recentSessions.map((session, idx) => (
                  <motion.div 
                    key={idx} 
                    whileHover={{ x: 4 }}
                    className="group p-4 rounded-2xl border border-slate-800 bg-slate-950/50 hover:bg-slate-800 hover:border-slate-700 transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-bold text-slate-200 line-clamp-1 group-hover:text-white transition-colors">{session.topic}</h4>
                      <span className="text-[10px] font-black bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-400 uppercase tracking-widest">
                        {session.date}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-purple-500" /> {session.totalDuration}m
                      </span>
                      <span className="flex items-center gap-1.5">
                        <LayoutGrid className="w-3 h-3 text-indigo-500" /> {session.phasesCompleted || 0} phases
                      </span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-12 text-center">
                  <p className="text-sm text-slate-500 italic font-medium">No study sessions yet.</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Learning Analytics Section */}
      <motion.div variants={itemVariants} className="space-y-8 pt-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/10 rounded-xl border border-purple-500/20">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white tracking-tight">Learning Analytics</h3>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-black">Deep Work Insights</p>
          </div>
        </div>

        {/* Analytics Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Total Study Time */}
          <Card className="p-5 bg-slate-900 border-slate-800 hover:border-purple-500/30 transition-all group">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 group-hover:text-purple-400 transition-colors">Total Time</p>
            <p className="text-2xl font-black text-white">{totalStudyTime}m</p>
          </Card>

          {/* Average Session Duration */}
          <Card className="p-5 bg-slate-900 border-slate-800 hover:border-purple-500/30 transition-all group">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 group-hover:text-purple-400 transition-colors">Avg Session</p>
            <p className="text-2xl font-black text-white">{avgSessionDuration}m</p>
          </Card>

          {/* Longest Session */}
          <Card className="p-5 bg-slate-900 border-slate-800 hover:border-purple-500/30 transition-all group">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 group-hover:text-purple-400 transition-colors">Longest Session</p>
            <p className="text-2xl font-black text-white">{longestSession}m</p>
          </Card>

          {/* Total Sessions */}
          <Card className="p-5 bg-slate-900 border-slate-800 hover:border-purple-500/30 transition-all group">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 group-hover:text-purple-400 transition-colors">Total Sessions</p>
            <p className="text-2xl font-black text-white">{totalSessions}</p>
          </Card>

          {/* Most Studied Topic */}
          <Card className="p-5 bg-slate-900 border-slate-800 hover:border-purple-500/30 transition-all col-span-2 md:col-span-1 group">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 group-hover:text-purple-400 transition-colors">Top Focus</p>
            <p className="text-base font-black text-white truncate" title={mostStudiedTopic}>{mostStudiedTopic}</p>
          </Card>

          {/* Current Streak */}
          <Card className="p-5 bg-slate-900 border-slate-800 hover:border-purple-500/30 transition-all group">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 group-hover:text-purple-400 transition-colors">Active Streak</p>
            <p className="text-2xl font-black text-white">{streak}d</p>
          </Card>
        </div>

        {/* Visualizations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Weekly Bar Chart */}
          <Card className="p-6 bg-slate-900 border-slate-800">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Weekly Study Time</h4>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5 font-black">Last 7 Days</p>
              </div>
              <span className="text-[10px] font-black text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded">
                Active
              </span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyChartData}>
                  <defs>
                    <linearGradient id="purpleBarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#c084fc" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#818cf8" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="dayName" 
                    stroke="#475569" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#475569" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    unit="m"
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(168, 85, 247, 0.05)' }}
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      borderColor: '#1e293b', 
                      borderRadius: '12px',
                      fontSize: '11px',
                      color: '#cbd5e1'
                    }}
                    labelStyle={{ fontWeight: 'black', color: '#fff', textTransform: 'uppercase' }}
                  />
                  <Bar 
                    dataKey="duration" 
                    fill="url(#purpleBarGrad)" 
                    radius={[6, 6, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Monthly Area Chart */}
          <Card className="p-6 bg-slate-900 border-slate-800">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Monthly Study Trend</h4>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5 font-black">Last 30 Days</p>
              </div>
              <span className="text-[10px] font-black text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
                Trend
              </span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyChartData}>
                  <defs>
                    <linearGradient id="purpleAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="label" 
                    stroke="#475569" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value, idx) => idx % 5 === 0 ? value : ''}
                  />
                  <YAxis 
                    stroke="#475569" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    unit="m"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      borderColor: '#1e293b', 
                      borderRadius: '12px',
                      fontSize: '11px',
                      color: '#cbd5e1'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="duration" 
                    stroke="#a855f7" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#purpleAreaGrad)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
}
