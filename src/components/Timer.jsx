import React, { useState, useEffect, useRef } from "react";
import { Play, Pause } from "lucide-react";

/**
 * A reusable countdown timer component
 * @param {number} durationMinutes - Total duration in minutes
 * @param {function} onComplete - Callback when timer hits 0
 */
export function Timer({ durationMinutes, onComplete }) {
  const [seconds, setSeconds] = useState(durationMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);

  // Reset timer when duration changes
  useEffect(() => {
    setSeconds(durationMinutes * 60);
    setIsRunning(false);
  }, [durationMinutes]);

  useEffect(() => {
    if (isRunning && seconds > 0) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    } else if (seconds === 0) {
      clearInterval(timerRef.current);
      onComplete?.();
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning, seconds, onComplete]);

  const formatTime = () => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleTimer = () => setIsRunning(!isRunning);
  
  const progress = (seconds / (durationMinutes * 60)) * 100;

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-center justify-center w-72 h-72 mb-10">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="144"
            cy="144"
            r="132"
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            className="text-slate-900"
          />
          <circle
            cx="144"
            cy="144"
            r="132"
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={829.38}
            strokeDashoffset={829.38 * (1 - progress / 100)}
            strokeLinecap="round"
            className="text-purple-600 transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-7xl font-black tabular-nums tracking-tighter text-white drop-shadow-2xl">
            {formatTime()}
          </span>
          <span className="text-xs font-black text-slate-500 mt-3 uppercase tracking-widest border border-slate-800 px-3 py-1 rounded-full bg-slate-900/50">
            {durationMinutes} MIN GOAL
          </span>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={toggleTimer}
          className={`flex items-center justify-center gap-3 px-10 py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl group ${
            isRunning 
              ? "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white" 
              : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-purple-500/20 hover:scale-105 active:scale-95"
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5 fill-current" /> Pause
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" /> Start Focus
            </>
          )}
        </button>
      </div>
    </div>
  );
}

