import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronRight, 
  ChevronLeft, 
  Target, 
  LayoutDashboard, 
  Sparkles, 
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Loader2
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Timer } from "../components/Timer";
import { ResourceLink } from "../components/planner/ResourceLink";
import { useAuth } from "../context/AuthContext";
import { dbService } from "../services/dbService";

export function DeepWork() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(location.state?.plan || null);
  const [currentPhaseIdx, setCurrentPhaseIdx] = useState(0);
  const [completedTasks, setCompletedTasks] = useState({});
  const [sessionStart] = useState(new Date());
  const [completedPhases, setCompletedPhases] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAbandonModal, setShowAbandonModal] = useState(false);

  // Fallback if plan is missing (e.g. refresh)
  if (!plan) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center space-y-8 animate-fade-in">
        <div className="w-20 h-20 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
          <AlertCircle className="w-10 h-10 text-slate-600" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Session Lost</h2>
          <p className="text-slate-500 mt-3 font-medium">We couldn't locate your active study architecture. Please re-initialize via the AI Planner.</p>
        </div>
        <Button onClick={() => navigate("/planner")} className="w-full bg-slate-100 text-slate-900 hover:bg-white h-12 font-black uppercase tracking-widest text-[10px]">
          Go to AI Planner
        </Button>
      </div>
    );
  }

  const phases = plan.phases || [];
  const currentPhase = phases[currentPhaseIdx];

  const toggleTask = (index) => {
    const key = `${currentPhaseIdx}-${index}`;
    setCompletedTasks(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePhaseComplete = () => {
    if (currentPhaseIdx < phases.length - 1) {
      setCompletedPhases(prev => prev + 1);
      setCurrentPhaseIdx(prev => prev + 1);
    } else {
      setCompletedPhases(phases.length);
      finishSession();
    }
  };

  const finishSession = async () => {
    setIsFinished(true);
    setSaving(true);
    try {
      const now = new Date();
      const totalMinutes = Math.round((now - sessionStart) / 60000);
      
      const sessionData = {
        topic: plan.title,
        totalDuration: totalMinutes || plan.total_duration,
        phasesCompleted: phases.length,
        startedAt: sessionStart,
        completedAt: now
      };
      await dbService.saveStudySession(user.uid, sessionData);
    } catch (error) {
      console.error("Error saving session:", error);
    } finally {
      setSaving(false);
    }
  };

  if (isFinished) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto py-12"
      >
        <Card className="p-16 text-center bg-slate-900 border-slate-800 shadow-3xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-indigo-600" />
          
          <div className="w-24 h-24 bg-emerald-500/10 rounded-[32px] flex items-center justify-center mx-auto mb-10 border border-emerald-500/20">
            <CheckCircle2 className="w-12 h-12 text-emerald-400" />
          </div>
          
          <h2 className="text-4xl font-black text-white tracking-tighter mb-4">Mastery Achieved!</h2>
          <p className="text-slate-400 text-lg font-medium max-w-sm mx-auto">You've successfully integrated: "{plan.title}"</p>
          
          <div className="grid grid-cols-2 gap-6 mt-12">
            <div className="p-6 bg-slate-950/50 rounded-3xl border border-slate-800">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Duration</p>
              <p className="text-3xl font-black text-white">
                {Math.round((new Date() - sessionStart) / 60000)}m
              </p>
            </div>
            <div className="p-6 bg-slate-950/50 rounded-3xl border border-slate-800">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Milestones Hit</p>
              <p className="text-3xl font-black text-white">{phases.length}</p>
            </div>
          </div>

          <div className="pt-12 flex flex-col sm:flex-row gap-4">
            <Button onClick={() => navigate("/")} variant="ghost" className="flex-1 h-14 bg-slate-800/50 text-white font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-colors">
              <LayoutDashboard className="w-4 h-4 mr-2" /> Hub
            </Button>
            <Button onClick={() => navigate("/history")} className="flex-1 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-purple-500/20">
              Analysis <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          
          {saving && (
            <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <Loader2 className="w-3 h-3 animate-spin" /> Archiving Knowledge...
            </div>
          )}
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-4 gap-12 pb-24">
      {/* Session Progress Sidebar */}
      <div className="lg:col-span-1 space-y-8 order-2 lg:order-1">
        <div className="space-y-4">
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Session Architecture</h4>
          <Card className="p-2 bg-slate-900 border-slate-800">
            <div className="space-y-1">
              {phases.map((phase, idx) => (
                <div 
                  key={idx}
                  className={`flex items-center gap-4 p-4 rounded-2xl transition-all relative ${
                    idx === currentPhaseIdx 
                      ? "bg-purple-500/10 text-white border border-purple-500/20 shadow-lg shadow-purple-500/5" 
                      : idx < currentPhaseIdx 
                      ? "opacity-40 grayscale" 
                      : "text-slate-500 hover:bg-slate-800/30"
                  }`}
                >
                  {idx < currentPhaseIdx ? (
                    <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                  ) : idx === currentPhaseIdx ? (
                    <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center border border-purple-500/30">
                      <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border border-slate-700 flex items-center justify-center text-[10px] font-black">
                      {idx + 1}
                    </div>
                  )}
                  <div className="flex-grow min-w-0">
                    <p className={`text-sm font-black truncate tracking-tight ${idx === currentPhaseIdx ? "text-white" : ""}`}>
                      {phase.phase_title}
                    </p>
                    <p className="text-[9px] font-black opacity-40 uppercase tracking-tighter">{phase.duration_minutes} MIN</p>
                  </div>
                  {idx === currentPhaseIdx && (
                    <motion.div 
                      layoutId="active-indicator"
                      className="absolute left-0 w-1 h-6 bg-purple-500 rounded-r-full"
                    />
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Current Phase Resources */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentPhaseIdx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-4"
          >
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Essential Resources</h4>
            {currentPhase.resources?.length > 0 ? (
              <div className="space-y-3">
                {currentPhase.resources.map((res, idx) => (
                  <ResourceLink key={idx} resource={res} />
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-slate-600 font-bold uppercase p-6 border border-dashed border-slate-800 rounded-3xl text-center italic">
                Direct Focus Required
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Main Focus Area */}
      <div className="lg:col-span-3 space-y-10 order-1 lg:order-2">
        <div className="flex items-center justify-between">
          <motion.div whileHover={{ x: -2 }}>
            <button 
              onClick={() => setShowAbandonModal(true)} 
              className="flex items-center text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-2" /> Abandon Session
            </button>
          </motion.div>
          <div className="px-4 py-2 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-xl border border-indigo-500/20 shadow-lg shadow-indigo-500/5">
             Milestone {currentPhaseIdx + 1} / {phases.length}
          </div>
        </div>

        <Card className="p-12 md:p-20 bg-slate-900 border-slate-800 relative overflow-hidden text-center rounded-[48px] shadow-3xl">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Sparkles className="w-32 h-32 text-purple-500" />
          </div>
          
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-[10px] font-black text-purple-500 uppercase tracking-[0.3em] mb-4">Active Objective</span>
            <h2 className="text-5xl font-black text-white tracking-tighter mb-12 max-w-2xl">{currentPhase.phase_title}</h2>
            
            <Timer 
              durationMinutes={parseInt(currentPhase.duration_minutes)} 
              onComplete={handlePhaseComplete} 
            />

            <div className="mt-16">
              <Button onClick={handlePhaseComplete} variant="ghost" className="text-slate-500 hover:text-white font-black uppercase tracking-widest text-[10px] gap-3 bg-slate-950/50 px-8 h-12 rounded-2xl border border-slate-800/50 hover:bg-slate-800 transition-all">
                Advance Milestone <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Concept Tags */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={`concepts-${currentPhaseIdx}`}>
            <Card className="p-8 bg-slate-900 border-slate-800 rounded-3xl h-full border-t-purple-500/30">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Core Concepts
              </h4>
              <div className="flex flex-wrap gap-2.5">
                {currentPhase.concepts?.map((concept, idx) => (
                  <span key={idx} className="px-4 py-2 bg-slate-950 text-slate-300 text-[11px] font-bold rounded-xl border border-slate-800/50 hover:border-purple-500/30 transition-colors">
                    {typeof concept === "string" ? concept : concept.title}
                  </span>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Practice Tasks */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={`tasks-${currentPhaseIdx}`} transition={{ delay: 0.1 }}>
            <Card className="p-8 bg-slate-900 border-slate-800 rounded-3xl h-full border-t-indigo-500/30">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Target className="w-3.5 h-3.5 text-indigo-400" /> Success Criteria
              </h4>
              <div className="space-y-3.5">
                {currentPhase.practice_tasks?.map((task, idx) => (
                  <label 
                    key={idx} 
                    className={`flex items-start gap-4 p-4 rounded-2xl cursor-pointer transition-all border ${
                      completedTasks[`${currentPhaseIdx}-${idx}`] 
                        ? "bg-slate-950/50 border-emerald-500/10 opacity-60" 
                        : "bg-slate-950/30 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="relative flex items-center mt-0.5">
                      <input 
                        type="checkbox"
                        checked={completedTasks[`${currentPhaseIdx}-${idx}`] || false}
                        onChange={() => toggleTask(idx)}
                        className="peer appearance-none w-5 h-5 rounded-lg border-2 border-slate-700 checked:bg-emerald-500 checked:border-emerald-500 transition-all cursor-pointer"
                      />
                      <CheckCircle2 className="absolute w-3.5 h-3.5 text-slate-950 opacity-0 peer-checked:opacity-100 left-0.5 pointer-events-none transition-opacity" />
                    </div>
                    <span className={`text-sm font-semibold tracking-tight ${completedTasks[`${currentPhaseIdx}-${idx}`] ? "line-through text-slate-500" : "text-slate-300"}`}>
                      {typeof task === "string" ? task : task.title}
                    </span>
                  </label>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Abandon Session Confirmation Modal */}
      <AnimatePresence>
        {showAbandonModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAbandonModal(false)}
              className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm"
            />
            
            {/* Modal Content */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-slate-900 border border-slate-800/80 p-8 rounded-3xl max-w-md w-full shadow-2xl z-10 overflow-hidden text-center"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-purple-600" />
              
              <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              
              <h3 className="text-xl font-black text-white tracking-tight mb-3">Abandon Session?</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                Are you sure you want to abandon this study session? Your current progress in this session will not be saved.
              </p>
              
              <div className="flex gap-4">
                <Button 
                  onClick={() => setShowAbandonModal(false)} 
                  variant="ghost" 
                  className="flex-1 h-12 bg-slate-800/50 text-white font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    setShowAbandonModal(false);
                    navigate("/");
                  }} 
                  className="flex-1 h-12 bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-500/10 transition-colors"
                >
                  Abandon Session
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
