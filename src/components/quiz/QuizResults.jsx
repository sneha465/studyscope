import React from "react";
import { motion } from "framer-motion";
import { Trophy, Target, ArrowRight, RotateCcw } from "lucide-react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { QuizQuestion } from "./QuizQuestion";

export function QuizResults({ attempt, onViewHistory, onGoDashboard }) {
  const { score, totalQuestions, percentage, topic, answers } = attempt;

  const getGradeColor = () => {
    if (percentage >= 80) return "text-green-400";
    if (percentage >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="space-y-8 pb-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6"
      >
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-purple-500/30 flex items-center justify-center">
          <Trophy className={`w-10 h-10 ${getGradeColor()}`} />
        </div>
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Quiz Complete!</h1>
          <p className="text-slate-400 mt-2">{topic}</p>
        </div>
        <div className="flex items-center justify-center gap-8">
          <div>
            <p className={`text-5xl font-black ${getGradeColor()}`}>{percentage}%</p>
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mt-1">Score</p>
          </div>
          <div className="w-px h-16 bg-slate-800" />
          <div>
            <p className="text-5xl font-black text-white">
              {score}/{totalQuestions}
            </p>
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mt-1">Correct</p>
          </div>
        </div>
      </motion.div>

      <Card className="p-6 bg-slate-900 border-slate-800">
        <div className="flex items-center gap-3 mb-6">
          <Target className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-bold text-white">Answer Review</h2>
        </div>
        <div className="space-y-10">
          {answers.map((answer, idx) => (
            <QuizQuestion
              key={answer.questionId}
              question={{
                question: answer.question,
                options: answer.options,
                correct_answer: answer.correct_answer,
                explanation: answer.explanation,
                topic: answer.topic,
                difficulty: answer.difficulty,
              }}
              index={idx}
              selected={answer.selected}
              showResults
              disabled
            />
          ))}
        </div>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          variant="outline"
          className="border-slate-800 text-slate-300 hover:bg-slate-900 gap-2"
          onClick={onViewHistory}
        >
          <RotateCcw className="w-4 h-4" /> Quiz History
        </Button>
        <Button
          className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 border-0"
          onClick={onGoDashboard}
        >
          Dashboard <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
