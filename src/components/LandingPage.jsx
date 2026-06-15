import React from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Target, Clock, Zap, BarChart3 } from "lucide-react";
import { Button } from "./ui/Button";

export function LandingPage({ onGetStarted }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 overflow-x-hidden">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-slate-900/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Sparkles className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">StudyScope</span>
        </div>
        <Button variant="outline" size="sm" className="border-slate-800 text-slate-300 hover:bg-slate-900" onClick={onGetStarted}>
          Sign In
        </Button>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-24 pb-32">
        <motion.div 
          className="text-center space-y-8"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-widest"
          >
            <Sparkles className="w-4 h-4" /> AI-Powered Study Companion
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-6xl md:text-8xl font-black tracking-tight leading-[1.05] text-white"
          >
            Study smarter, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">not harder.</span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="max-w-2xl mx-auto text-xl text-slate-400 leading-relaxed"
          >
            Optimize your learning path with AI-driven session planning, real-time focus tracking, and automated summaries.
          </motion.p>

          <motion.div variants={itemVariants} className="pt-4">
            <Button 
              size="lg" 
              className="h-14 px-10 text-lg gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 border-0 shadow-2xl shadow-purple-500/20 transition-all hover:scale-105" 
              onClick={onGetStarted}
            >
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>

          {/* Product Preview Card */}
          <motion.div 
            variants={itemVariants}
            className="mt-24 relative max-w-5xl mx-auto"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-2xl rounded-[32px] -z-10" />
            <div className="bg-slate-900 border border-slate-800 p-2 rounded-[32px] shadow-2xl shadow-black/50">
              <div className="bg-slate-950/50 rounded-[24px] border border-slate-800/50 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-8">
                  {/* Streak Card */}
                  <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-orange-500/10 rounded-lg">
                        <Zap className="w-5 h-5 text-orange-500" />
                      </div>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Streak</span>
                    </div>
                    <p className="text-3xl font-black text-white">12 Days</p>
                  </div>

                  {/* Weekly Time Card */}
                  <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Clock className="w-5 h-5 text-blue-500" />
                      </div>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Time</span>
                    </div>
                    <p className="text-3xl font-black text-white">18.4 <span className="text-sm font-bold text-slate-500">hrs</span></p>
                  </div>

                  {/* Efficiency Card */}
                  <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-purple-500/10 rounded-lg">
                        <BarChart3 className="w-5 h-5 text-purple-500" />
                      </div>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Efficiency</span>
                    </div>
                    <p className="text-3xl font-black text-white">94%</p>
                  </div>

                  {/* Activity Heatmap Preview */}
                  <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 flex flex-col justify-between">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Activity</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {[...Array(24)].map((_, i) => (
                        <div key={i} className={`w-3 h-3 rounded-sm ${i % 4 === 0 ? 'bg-purple-500' : 'bg-slate-800'}`} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>

      <footer className="py-20 border-t border-slate-900 text-center text-slate-500 text-sm">
        <p>© 2026 StudyScope. Built for the future of learning.</p>
      </footer>
    </div>
  );
}
