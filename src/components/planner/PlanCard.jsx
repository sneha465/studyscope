import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  Clock,
  ExternalLink,
  Play,
  BookOpen,
  Github,
  Code2,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  Sparkles,
  Target,
  HelpCircle,
  Link as LinkIcon
} from "lucide-react";
import { Card, CardHeader } from "../ui/Card";
import { Button } from "../ui/Button";
import { ResourceLink } from "./ResourceLink";
import { useAuth } from "../../context/AuthContext";
import { dbService } from "../../services/dbService";

export function PlanCard({ plan, onStart }) {
  const { user } = useAuth();
  const [feedbackStatus, setFeedbackStatus] = useState({}); // { [resourceUrl]: 'useful' | 'not_useful' }
  const [quizAnswers, setQuizAnswers] = useState({}); // { [questionKey]: selectedOption }

  if (!plan) return null;

  const phases = plan.phases || [];

  const handleFeedback = async (url, type) => {
    if (!user) return;
    try {
      await dbService.saveResourceFeedback(user.uid, url, type);
      setFeedbackStatus(prev => ({ ...prev, [url]: type }));
    } catch (error) {
      console.error("Failed to save feedback", error);
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
      className="max-w-4xl mx-auto space-y-8 pb-20"
    >
      <Card className="bg-slate-900 border-slate-800 overflow-visible relative p-8">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Clock className="w-48 h-48 text-purple-600" />
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-purple-500/10 text-purple-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-purple-500/20 italic">
                {plan.category || 'Curated Path'}
              </span>
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">{plan.title}</h2>
            <p className="text-slate-500 font-medium mt-1">{plan.total_duration} Focused Study Path</p>
          </div>
          <Button 
            onClick={onStart} 
            className="gap-2 px-8 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 border-0 hover:opacity-90 shadow-xl shadow-purple-500/20 active:scale-95 transition-all text-sm font-black uppercase tracking-widest"
          >
            <Play className="w-4 h-4 fill-current" /> Start Deep Work
          </Button>
        </div>

        <div className="space-y-12">
          {phases.map((phase, pIdx) => {
            const isRefactored = plan.isRefactoredPlan;
            return (
              <div key={pIdx} className="relative pl-10 border-l-2 border-slate-800 last:border-0 pb-12 last:pb-4">
                <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-slate-950 border-2 border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.4)]" />

                <div className="mb-8">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white leading-tight">{phase.phase_title}</h3>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-widest border border-slate-700">
                        {phase.duration_minutes}m
                      </span>
                      {phase.estimated_difficulty && (
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                          phase.estimated_difficulty === 'Beginner' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          phase.estimated_difficulty === 'Intermediate' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {phase.estimated_difficulty}
                        </span>
                      )}
                    </div>
                  </div>

                  {phase.concepts && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {phase.concepts.map((concept, cIdx) => (
                        <span key={cIdx} className="px-3 py-1 rounded-xl bg-purple-500/5 text-purple-400 text-xs font-black uppercase tracking-widest border border-purple-500/10">
                          {typeof concept === "string" ? concept : concept.title}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {isRefactored ? (
                  /* REFACTORED LEARNING COACH DESIGN */
                  <div className="space-y-8">
                    {/* Concept Overview */}
                    {phase.concept_overview && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 pl-1">
                          <BookOpen className="w-4 h-4 text-purple-400" /> Concept Overview
                        </h4>
                        <p className="text-sm text-slate-305 leading-relaxed font-medium bg-slate-950/40 p-6 rounded-2xl border border-slate-800/80">
                          {phase.concept_overview}
                        </p>
                      </div>
                    )}

                    {/* Key Takeaways */}
                    {phase.key_takeaways && phase.key_takeaways.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 pl-1">
                          <Sparkles className="w-4 h-4 text-indigo-400" /> Key Takeaways
                        </h4>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-950/20 p-6 rounded-2xl border border-slate-800/60">
                          {phase.key_takeaways.map((takeaway, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-sm text-slate-300 font-medium">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                              <span>{takeaway}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Common Mistakes */}
                    {phase.common_mistakes && phase.common_mistakes.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 pl-1">
                          <AlertCircle className="w-4 h-4 text-rose-450" /> Common Pitfalls
                        </h4>
                        <ul className="space-y-2.5 bg-rose-500/5 p-6 rounded-2xl border border-rose-500/15">
                          {phase.common_mistakes.map((mistake, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-sm text-rose-200/90 font-medium">
                              <span className="text-rose-500 font-bold mt-0.5">⚠️</span>
                              <span>{mistake}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Practice Tasks */}
                    {phase.practice_tasks && phase.practice_tasks.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 pl-1">
                          <Target className="w-4 h-4 text-indigo-400" /> Practice Exercises
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {phase.practice_tasks.map((task, idx) => (
                            <div key={idx} className="p-5 bg-slate-950/50 rounded-2xl border border-slate-800/80 hover:border-indigo-500/20 transition-all">
                              <h5 className="font-bold text-white text-sm mb-1.5">{typeof task === "string" ? task : task.title}</h5>
                              {task.description && (
                                <p className="text-xs text-slate-400 leading-relaxed font-medium">{task.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Knowledge Check (Interactive Quiz) */}
                    {phase.knowledge_check && phase.knowledge_check.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 pl-1">
                          <HelpCircle className="w-4 h-4 text-amber-400" /> Knowledge Check
                        </h4>
                        <div className="space-y-6 bg-slate-950/40 p-6 rounded-2xl border border-slate-800/60">
                          {phase.knowledge_check.map((qc, qIdx) => {
                            const key = `${pIdx}-${qIdx}`;
                            const selected = quizAnswers[key];
                            const isCorrect = selected === qc.correct_answer;
                            
                            return (
                              <div key={qIdx} className="space-y-3 border-b border-slate-800/40 last:border-0 pb-6 last:pb-0">
                                <p className="text-sm font-bold text-slate-200">{qIdx + 1}. {qc.question}</p>
                                <div className="grid grid-cols-1 gap-2 pl-1 max-w-xl">
                                  {qc.options.map((option, oIdx) => {
                                    const isOptionSelected = selected === option;
                                    const isOptionCorrect = option === qc.correct_answer;
                                    
                                    let btnStyle = "bg-slate-900 border-slate-800/80 text-slate-350 hover:bg-slate-850 hover:text-white";
                                    if (selected) {
                                      if (isOptionCorrect) {
                                        btnStyle = "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold";
                                      } else if (isOptionSelected) {
                                        btnStyle = "bg-rose-500/10 border-rose-500/30 text-rose-400 font-bold";
                                      } else {
                                        btnStyle = "bg-slate-900/40 border-slate-900/50 text-slate-600 opacity-60";
                                      }
                                    }
                                    
                                    return (
                                      <button
                                        key={oIdx}
                                        disabled={!!selected}
                                        onClick={() => setQuizAnswers(prev => ({ ...prev, [key]: option }))}
                                        className={`text-left px-4 py-2.5 rounded-xl border text-xs font-medium transition-all duration-200 ${btnStyle}`}
                                      >
                                        {option}
                                      </button>
                                    );
                                  })}
                                </div>
                                {selected && (
                                  <motion.div 
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="pl-2 mt-2 space-y-2"
                                  >
                                    <div className={`text-[10px] font-black uppercase tracking-wider ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                                      {isCorrect ? '✓ Correct' : `✗ Incorrect (Correct: ${qc.correct_answer})`}
                                    </div>
                                    {qc.explanation && (
                                      <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800/80 text-xs text-slate-400 leading-relaxed font-semibold">
                                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block mb-1">Explanation</span>
                                        {qc.explanation}
                                      </div>
                                    )}
                                  </motion.div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Optional References (Hidden by default / only shown if present) */}
                    {phase.optional_references && phase.optional_references.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 pl-1">
                          <LinkIcon className="w-4 h-4 text-purple-400" /> Supplementary References
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {phase.optional_references.map((res, idx) => (
                            <ResourceLink 
                              key={idx} 
                              resource={res} 
                              feedbackStatus={feedbackStatus}
                              onFeedback={handleFeedback}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* ORIGINAL SCHEMA DESIGN FALLBACK */
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {phase.resources?.map((res, idx) => (
                        <ResourceLink 
                          key={idx} 
                          resource={res} 
                          feedbackStatus={feedbackStatus}
                          onFeedback={handleFeedback}
                        />
                      ))}
                    </div>

                    {phase.practice_tasks && phase.practice_tasks.length > 0 && (
                      <div className="mt-8 bg-slate-950/50 rounded-2xl p-6 border border-slate-800">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <Target className="w-3.5 h-3.5 text-purple-500" /> Practice Exercises
                        </h4>
                        <ul className="space-y-3">
                          {phase.practice_tasks.map((task, tIdx) => (
                            <li key={tIdx} className="flex items-start gap-3 text-sm text-slate-400">
                              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-600 flex-shrink-0" />
                              <span className="leading-relaxed font-medium">{typeof task === "string" ? task : task.title}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <div className="text-center pt-8">
        <button
          onClick={() => window.location.reload()}
          className="text-xs text-slate-600 hover:text-purple-400 font-black uppercase tracking-widest transition-all flex items-center gap-2 mx-auto"
        >
          <Sparkles className="w-4 h-4" /> Need a different path? Generate New Plan
        </button>
      </div>
    </motion.div>
  );
}
