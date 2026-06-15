import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { History as HistoryIcon, Search, Calendar, Clock, ChevronRight, FileText, CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardHeader } from "../ui/Card";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { dbService } from "../../services/dbService";
import { useAuth } from "../../context/AuthContext";

export function StudyHistory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchSessions() {
      try {
        const data = await dbService.getSessions(user.uid);
        setSessions(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchSessions();
  }, [user.uid]);

  const filteredSessions = sessions
    .filter(s => s.topic.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const dateA = a.completedAt?.seconds ? a.completedAt.seconds : new Date(a.completedAt || a.startedAt).getTime() / 1000;
      const dateB = b.completedAt?.seconds ? b.completedAt.seconds : new Date(b.completedAt || b.startedAt).getTime() / 1000;
      return dateB - dateA;
    });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
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
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">History</h1>
          <p className="text-slate-400 mt-2 text-lg font-medium">Review your learning journey.</p>
        </div>
        <div className="w-full md:w-80">
          <Input
            placeholder="Search sessions..."
            icon={<Search className="w-4 h-4 text-slate-500" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-900 border-slate-800 text-white h-12"
          />
        </div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-6"
      >
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
            <p className="text-slate-500 font-medium">Retrieving archives...</p>
          </div>
        ) : filteredSessions.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {filteredSessions.map((session) => (
              <motion.div
                key={session.id}
                variants={itemVariants}
                layout
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                onClick={() => navigate(`/session/${session.id}`)}
                className="group cursor-pointer"
              >
                <Card className="p-0 bg-slate-900 border-slate-800 overflow-hidden hover:border-purple-500/50 hover:bg-slate-800/50 transition-all duration-300">
                  <div className="flex flex-col md:flex-row md:items-stretch">
                    <div className="p-8 flex-grow">
                      <div className="flex items-center gap-4 mb-4">
                        <span className="px-3 py-1 bg-slate-950 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-800 group-hover:border-purple-500/30 group-hover:text-purple-400 transition-colors">
                          {session.date}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                          <Clock className="w-3.5 h-3.5 text-indigo-500" />
                          {session.totalDuration} session
                        </div>
                      </div>
                      <h3 className="text-2xl font-black text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-purple-500 transition-all duration-300">
                        {session.topic}
                      </h3>
                      
                      {session.summary?.concepts ? (
                        <div className="mt-6 flex flex-wrap gap-2">
                          {session.summary.concepts.slice(0, 3).map((c, i) => (
                            <span key={i} className="px-3 py-1 bg-purple-500/5 border border-purple-500/10 rounded-xl text-[10px] text-purple-400 font-black uppercase tracking-widest">
                              {typeof c === "string" ? c : c.title}
                            </span>
                          ))}
                          {session.summary.concepts.length > 3 && (
                            <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest self-center ml-1">
                              + {session.summary.concepts.length - 3} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          Completed {session.phasesCompleted} focus phases
                        </div>
                      )}
                    </div>

                    <div className="md:w-72 bg-slate-950/30 p-8 border-t md:border-t-0 md:border-l border-slate-800 flex flex-col justify-center items-center text-center">
                      <p className="text-sm text-slate-500 line-clamp-2 italic mb-6 font-medium">
                        {session.summary?.summary ? `"${session.summary.summary.split('.')[0]}..."` : "Deep work session focused on mastery."}
                      </p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-purple-400 hover:bg-purple-500/10 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/session/${session.id}`);
                        }}
                      >
                        Session Insights →
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-24 text-center border-2 border-dashed border-slate-800 rounded-[32px] bg-slate-900/20"
          >
            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <HistoryIcon className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No sessions yet</h3>
            <p className="text-slate-500 font-medium">Your learning journey begins with your first session.</p>
            <Button onClick={() => navigate('/planner')} className="mt-8 bg-gradient-to-r from-indigo-500 to-purple-600">
              Create First Session
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
