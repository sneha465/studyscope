import React, { useState, useMemo } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  ChevronRight, 
  Sparkles,
  Loader2,
  Trophy,
  Circle
} from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { useTimer } from "../../hooks/useTimer";
import { aiService } from "../../services/aiService";
import { dbService } from "../../services/dbService";
import { useAuth } from "../../context/AuthContext";

export function Timer({ plan, onComplete }) {
  const { user } = useAuth();
  const [currentTaskIdx, setCurrentTaskIdx] = useState(0);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [saving, setSaving] = useState(false);

  // Helper to parse duration into minutes
  const parseTime = (time) => {
    if (typeof time === "number") return time;
    if (!time) return 25;
    const num = parseInt(time.toString().match(/\d+/) || [25]);
    if (time.toString().toLowerCase().includes("hour")) return num * 60;
    return num;
  };

  // Convert phases to tasks for the timer
  const tasks = useMemo(() => {
    if (plan.tasks) return plan.tasks;
    if (plan.phases) {
      return plan.phases.map(phase => ({
        task: phase.phase_title,
        duration: parseTime(phase.duration_minutes)
      }));
    }
    return [{ task: "Study Session", duration: 25 }];
  }, [plan]);

  const { timeLeft, isActive, isPaused, start, pause, reset, formatTime, progress } = useTimer(
    tasks[currentTaskIdx]?.duration || 25,
    () => handleTaskComplete()
  );

  const handleTaskComplete = () => {
    const task = tasks[currentTaskIdx];
    if (task) {
      setCompletedTasks([...completedTasks, task.task]);
    }
    
    if (currentTaskIdx < tasks.length - 1) {
      setCurrentTaskIdx(currentTaskIdx + 1);
      reset();
    } else {
      generateSummary();
    }
  };

  const generateSummary = async () => {
    setShowSummary(true);
    setSaving(true);
    try {
      const summary = await aiService.generateSessionSummary(plan.title || plan.topic, completedTasks);
      setSummaryData(summary);
      
      // Save to Firebase
      await dbService.saveSession(user.uid, {
        topic: plan.title || plan.topic,
        tasks: completedTasks,
        summary: summary,
        totalDuration: plan.total_duration || plan.duration || plan.totalDuration
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (showSummary) {
    return (
      <Card className="max-w-2xl mx-auto border-brand-100 p-8 text-center animate-fade-in">
        {saving ? (
          <div className="py-12 space-y-4">
            <Loader2 className="w-12 h-12 text-brand-600 animate-spin mx-auto" />
            <h3 className="text-xl font-semibold">Generating Your AI Summary...</h3>
            <p className="text-slate-500">Evaluating your progress and planning next steps.</p>
          </div>
        ) : summaryData ? (
          <div className="space-y-8">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
                <Trophy className="w-10 h-10 text-yellow-600" />
              </div>
            </div>
            
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Session Complete!</h2>
              <p className="text-slate-500 mt-2">You successfully focused on {plan.title || plan.topic}</p>
            </div>

            <div className="text-left space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
               <div>
                 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Key Concepts</h4>
                 <div className="flex flex-wrap gap-2">
                   {summaryData.concepts.map((c, i) => (
                     <span key={i} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-sm text-slate-700">
                       {c}
                     </span>
                   ))}
                 </div>
               </div>
               
               <div>
                 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">AI Summary</h4>
                 <p className="text-slate-700 leading-relaxed">{summaryData.summary}</p>
               </div>

               <div className="p-4 bg-brand-50 rounded-xl border border-brand-100 flex gap-4">
                 <div className="mt-1">
                   <Sparkles className="w-5 h-5 text-brand-600" />
                 </div>
                 <div>
                    <h5 className="font-semibold text-brand-900">Next Step</h5>
                    <p className="text-brand-800 text-sm mt-0.5">{summaryData.nextStep}</p>
                 </div>
               </div>
            </div>

            <Button onClick={onComplete} className="w-full h-12 text-lg">
              Return to Dashboard
            </Button>
          </div>
        ) : (
          <div className="py-12">
            <p className="text-red-500">Something went wrong saving your session.</p>
            <Button onClick={onComplete} className="mt-4">Back to Dashboard</Button>
          </div>
        )}
      </Card>
    );
  }

  const currentTask = tasks[currentTaskIdx];

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      <div className="lg:col-span-2 space-y-6">
        <Card className="flex flex-col items-center justify-center py-12 border-slate-200 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
             <div className="w-full h-full bg-brand-600" style={{ clipPath: `inset(${100 - progress}% 0 0 0)` }}></div>
          </div>

          <h3 className="text-slate-500 font-medium mb-2">Current Focus</h3>
          <h2 className="text-2xl font-bold text-slate-900 mb-8">{currentTask?.task}</h2>
          
          <div className="relative flex items-center justify-center w-64 h-64">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-slate-100"
              />
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={753.9}
                strokeDashoffset={753.9 * (1 - progress / 100)}
                strokeLinecap="round"
                className="text-brand-600 transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-6xl font-black tabular-nums tracking-tighter text-slate-900">
                {formatTime()}
              </span>
              <span className="text-sm font-medium text-slate-400 mt-1 uppercase tracking-wider">
                {currentTask?.duration} MIN TOTAL
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-12">
            <Button 
              variant="outline" 
              size="lg" 
              className="rounded-full w-14 h-14 p-0"
              onClick={reset}
            >
              <RotateCcw className="w-6 h-6" />
            </Button>
            
            <Button 
              size="lg" 
              className="rounded-full w-20 h-20 p-0 shadow-xl shadow-brand-500/20"
              onClick={isActive && !isPaused ? pause : start}
            >
              {isActive && !isPaused ? (
                <Pause className="w-8 h-8 fill-current" />
              ) : (
                <Play className="w-8 h-8 fill-current ml-1" />
              )}
            </Button>

            <Button 
              variant="outline" 
              size="lg" 
              className="rounded-full w-14 h-14 p-0"
              onClick={handleTaskComplete}
            >
              <CheckCircle2 className="w-6 h-6" />
            </Button>
          </div>
        </Card>

        <div className="flex items-center justify-between p-6 bg-slate-900 rounded-2xl text-white">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                 <Sparkles className="w-6 h-6 text-brand-400" />
              </div>
              <div>
                 <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Studying</p>
                 <p className="text-lg font-bold truncate max-w-[200px]">{plan.title || plan.topic}</p>
              </div>
           </div>
           <div className="text-right">
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Up Next</p>
              <p className="font-medium text-slate-300 truncate max-w-[150px]">
                {currentTaskIdx < tasks.length - 1 ? tasks[currentTaskIdx+1].task : "Session Wrap-up"}
              </p>
           </div>
        </div>
      </div>

      <div className="space-y-6">
        <Card className="p-0 overflow-hidden border-slate-200">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-brand-600" />
              Session Phases
            </h3>
          </div>
          <div className="p-2">
            {tasks.map((task, idx) => (
              <div 
                key={idx}
                className={`flex items-center gap-3 p-4 rounded-xl transition-all ${
                  idx === currentTaskIdx 
                    ? "bg-brand-50 text-brand-700" 
                    : idx < currentTaskIdx 
                    ? "opacity-50" 
                    : "text-slate-400"
                }`}
              >
                {idx < currentTaskIdx ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : idx === currentTaskIdx ? (
                  <div className="w-5 h-5 rounded-full border-2 border-brand-500 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                  </div>
                ) : (
                  <Circle className="w-5 h-5" />
                )}
                <div className="flex-grow min-w-0">
                  <p className={`text-sm font-semibold truncate ${idx === currentTaskIdx ? "text-brand-900" : ""}`}>
                    {task.task}
                  </p>
                  <p className="text-xs">{task.duration}m</p>
                </div>
                {idx === currentTaskIdx && <ChevronRight className="w-4 h-4" />}
              </div>
            ))}
          </div>
        </Card>

        <div className="bg-brand-600 rounded-2xl p-6 text-white overflow-hidden relative group">
           <div className="relative z-10">
             <h4 className="font-bold flex items-center gap-2">
               <Sparkles className="w-4 h-4" />
               Study Tip
             </h4>
             <p className="text-sm text-brand-100 mt-2 leading-relaxed">
               Stay hydrated and take small eye breaks between tasks to maintain cognitive performance.
             </p>
           </div>
           <Sparkles className="absolute -bottom-4 -right-4 w-24 h-24 text-white/10 rotate-12 group-hover:rotate-45 transition-transform duration-700" />
        </div>
      </div>
    </div>
  );
}
