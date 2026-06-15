import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Clock, Target, ArrowRight, Loader2, BookOpen } from "lucide-react";
import { Card, CardHeader } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { aiService } from "../../services/aiService";

export function PlannerForm({ onPlanGenerated }) {
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState(90);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [useLearningCoach, setUseLearningCoach] = useState(true);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic) return;
    
    setLoading(true);
    setError("");
    try {
      const plan = await aiService.generateStudyPlan(topic, `${duration} minutes`, useLearningCoach ? "coach" : "standard");
      onPlanGenerated(plan);
    } catch (err) {
      setError("Failed to generate plan. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto space-y-12 pb-20"
    >
      <Card className="max-w-2xl mx-auto bg-slate-900 border-slate-800 shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-slate-800 flex items-center gap-4 bg-slate-900/50">
          <div className="p-3 bg-purple-500/10 rounded-2xl">
            <Sparkles className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">AI Planner</h2>
            <p className="text-sm text-slate-500 font-medium">Define your goals and let AI build your path.</p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="p-8 space-y-8">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Learning Objective</label>
            <Input 
              placeholder="e.g. React Hooks, Data Structures, Modern Art History..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={loading}
              className="h-14 bg-slate-950/50 border-slate-800 focus:border-purple-500 text-lg"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                Session Duration
              </label>
              <div className="flex gap-2">
                {[60, 90, 120].map((t) => (
                  <motion.button
                    key={t}
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setDuration(t)}
                    className={`flex-1 py-3 text-sm font-black uppercase tracking-widest rounded-xl border transition-all ${
                      duration === t 
                        ? "bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20" 
                        : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                    }`}
                  >
                    {t}m
                  </motion.button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Custom Minutes</label>
              <Input 
                type="number" 
                placeholder="e.g. 45"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                disabled={loading}
                className="h-12 bg-slate-950/50 border-slate-800"
              />
            </div>
          </div>

          {/* AI Learning Coach Toggle */}
          <div className="p-5 bg-slate-950/40 rounded-2xl border border-slate-800/85 flex items-center justify-between gap-6 hover:border-purple-500/20 transition-all">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                AI Learning Coach <span className="text-[9px] font-black text-purple-400 bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 rounded">BETA</span>
              </h4>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Self-contained interactive tutoring with concept overviews, takeaways, common mistakes, and quizzes.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none flex-shrink-0">
              <input 
                type="checkbox" 
                checked={useLearningCoach}
                onChange={(e) => setUseLearningCoach(e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-slate-850 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-500 after:border-slate-400 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600 peer-checked:after:bg-white peer-checked:after:border-transparent"></div>
            </label>
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm text-red-500 font-medium"
            >
              {error}
            </motion.p>
          )}

          <Button 
            type="submit" 
            className="w-full h-14 text-lg font-black uppercase tracking-widest gap-3 bg-gradient-to-r from-indigo-500 to-purple-600 border-0 hover:opacity-90 shadow-xl shadow-purple-500/20" 
            disabled={loading || !topic}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Synthesizing...
              </>
            ) : (
              <>
                Generate Session <ArrowRight className="w-5 h-5" />
              </>
            )}
          </Button>
        </form>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex flex-col items-center text-center p-6 bg-slate-900/40 rounded-3xl border border-slate-800/50 group hover:border-blue-500/30 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
            <Target className="w-6 h-6 text-blue-400" />
          </div>
          <h4 className="font-bold text-white mb-2">Clear Goals</h4>
          <p className="text-sm text-slate-500 leading-relaxed font-medium">AI breaks down complex topics into actionable milestones.</p>
        </div>
        <div className="flex flex-col items-center text-center p-6 bg-slate-900/40 rounded-3xl border border-slate-800/50 group hover:border-purple-500/30 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
            <Clock className="w-6 h-6 text-purple-400" />
          </div>
          <h4 className="font-bold text-white mb-2">Time Optimized</h4>
          <p className="text-sm text-slate-500 leading-relaxed font-medium">Scientifically balanced study and rest intervals.</p>
        </div>
        <div className="flex flex-col items-center text-center p-6 bg-slate-900/40 rounded-3xl border border-slate-800/50 group hover:border-emerald-500/30 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
            <BookOpen className="w-6 h-6 text-emerald-400" />
          </div>
          <h4 className="font-bold text-white mb-2">Smart Context</h4>
          <p className="text-sm text-slate-500 leading-relaxed font-medium">Personalized resources curated for your objective.</p>
        </div>
      </div>
    </motion.div>
  );
}
