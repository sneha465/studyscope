import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";

export function QuizQuestion({
  question,
  index,
  selected,
  onSelect,
  showResults = false,
  disabled = false,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-xs font-black text-purple-400">
          {index + 1}
        </span>
        <div className="flex-grow space-y-1">
          <p className="text-lg font-bold text-white leading-snug">{question.question}</p>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              {question.topic}
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
              {question.difficulty}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2 pl-11">
        {question.options.map((option, optIdx) => {
          const isSelected = selected === option;
          const isCorrect = option === question.correct_answer;
          let optionClass =
            "border-slate-800 bg-slate-950/50 hover:border-slate-700 hover:bg-slate-900";

          if (showResults) {
            if (isCorrect) {
              optionClass = "border-green-500/50 bg-green-500/10";
            } else if (isSelected && !isCorrect) {
              optionClass = "border-red-500/50 bg-red-500/10";
            } else {
              optionClass = "border-slate-800 bg-slate-950/30 opacity-60";
            }
          } else if (isSelected) {
            optionClass = "border-purple-500/50 bg-purple-500/10";
          }

          return (
            <button
              key={optIdx}
              type="button"
              disabled={disabled || showResults}
              onClick={() => onSelect(option)}
              className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-3 ${optionClass} ${
                disabled || showResults ? "cursor-default" : "cursor-pointer"
              }`}
            >
              <span className="flex-shrink-0 w-6 h-6 rounded-lg border border-slate-700 flex items-center justify-center text-[10px] font-black text-slate-500">
                {String.fromCharCode(65 + optIdx)}
              </span>
              <span className="text-sm font-medium text-slate-200 flex-grow">{option}</span>
              {showResults && isCorrect && (
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
              )}
              {showResults && isSelected && !isCorrect && (
                <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {showResults && question.explanation && (
        <div className="ml-11 p-4 rounded-xl bg-slate-900 border border-slate-800">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
            Explanation
          </p>
          <p className="text-sm text-slate-400 leading-relaxed">{question.explanation}</p>
        </div>
      )}
    </motion.div>
  );
}
