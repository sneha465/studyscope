import React from "react";

export function StudyHeatmap({ activity = {}, label = "sessions" }) {
  // Generate last 6 months of dates
  const today = new Date();
  const days = [];
  for (let i = 180; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    days.push(date.toISOString().split('T')[0]);
  }

  // Group by weeks
  const weeks = [];
  let currentWeek = [];
  days.forEach((day, i) => {
    currentWeek.push(day);
    if (new Date(day).getDay() === 6 || i === days.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  const getColor = (count) => {
    if (!count) return "bg-slate-800";
    if (count === 1) return "bg-purple-500/40";
    if (count === 2) return "bg-purple-500/70";
    return "bg-purple-500";
  };

  return (
    <div className="overflow-x-auto pb-4 custom-scrollbar">
      <div className="flex gap-1.5 min-w-max">
        {weeks.map((week, wIdx) => (
          <div key={wIdx} className="flex flex-col gap-1.5">
            {/* Fill empty days at start of first week if necessary */}
            {wIdx === 0 && week.length < 7 && Array.from({ length: 7 - week.length }).map((_, i) => (
              <div key={`empty-${i}`} className="w-3.5 h-3.5 rounded-sm bg-transparent" />
            ))}
            
            {week.map((day) => {
              const count = activity[day] || 0;
              return (
                <div
                  key={day}
                  title={`${day}: ${count} ${label}`}
                  className={`w-3.5 h-3.5 rounded-sm transition-colors ${getColor(count)}`}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs text-slate-400 font-medium">
        <span>Less</span>
        <div className="w-3 h-3 rounded-sm bg-slate-800" />
        <div className="w-3 h-3 rounded-sm bg-purple-500/40" />
        <div className="w-3 h-3 rounded-sm bg-purple-500/70" />
        <div className="w-3 h-3 rounded-sm bg-purple-500" />
        <span>More</span>
      </div>
    </div>
  );
}
