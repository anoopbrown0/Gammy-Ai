import React from "react";
import LucideIcon from "./LucideIcon";
import { Habit } from "../types";

interface RightPanelsProps {
  onOpenAICoach: () => void;
  isDark?: boolean;
  habits: Habit[];
  onToggleDay: (habitId: string, dayIndex: number, forceStatus?: 'completed' | 'skipped' | 'locked') => void;
  currentDay?: number;
  currentMonth?: string;
}

const getReminderTime = (habitName: string): string => {
  const name = habitName.toLowerCase();
  if (name.includes("gym") || name.includes("workout") || name.includes("run")) return "07:30 AM";
  if (name.includes("read") || name.includes("book")) return "12:00 PM";
  if (name.includes("medit") || name.includes("breath")) return "06:00 PM";
  if (name.includes("portfolio") || name.includes("code") || name.includes("dev")) return "09:00 AM";
  if (name.includes("walk") || name.includes("step")) return "05:00 PM";
  if (name.includes("water") || name.includes("drink")) return "Every 2 Hours";
  if (name.includes("english") || name.includes("lang") || name.includes("study")) return "08:00 PM";
  if (name.includes("sav") || name.includes("coin") || name.includes("money")) return "09:30 PM";
  return "08:00 AM"; // Default fallback
};

export const RightPanels: React.FC<RightPanelsProps> = ({ 
  isDark = false,
  habits,
  onToggleDay,
  currentDay = 20,
  currentMonth = "July",
}) => {
  const todayIdx = currentDay - 1;

  // Sort habits so that completed ones go to the bottom of the list
  const sortedHabits = [...habits].sort((a, b) => {
    const aDone = a.days && a.days[todayIdx] === "completed";
    const bDone = b.days && b.days[todayIdx] === "completed";
    if (aDone && !bDone) return 1;
    if (!aDone && bDone) return -1;
    return 0; // maintain order
  });

  return (
    <div 
      id="sabit-right-panels-stack"
      className="flex flex-col h-full"
    >
      {/* PANEL: Upcoming Reminders */}
      <div className={`rounded-2xl p-5 border transition-all duration-300 flex flex-col h-[380px] justify-between ${
        isDark 
          ? "bg-slate-900 border-slate-800 text-white shadow-[0_4px_20px_rgba(0,0,0,0.3)]" 
          : "bg-white border-[#E5E7EB] shadow-[0_4px_20px_rgba(15,23,42,0.03)]"
      }`}>
        {/* Header - Cleaned up (no black horizontal border underneath) */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center gap-1.5">
            <h4 className={`font-black text-xs tracking-tight ${isDark ? "text-slate-100" : "text-slate-800"}`}>Upcoming Reminders</h4>
          </div>
          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${
            isDark ? "bg-slate-800 border-slate-700 text-slate-400" : "bg-slate-50 border-[#E5E7EB] text-[#64748B]"
          }`}>
            Today
          </span>
        </div>

        {/* Checklist Container */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 custom-scrollbar min-h-0">
          {sortedHabits.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <LucideIcon name="CheckCircle" size={24} className="text-slate-400 opacity-60 mb-2" />
              <p className="text-xs font-bold text-slate-400">No active habits registered.</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Add some habits to see reminders.</p>
            </div>
          ) : (
            sortedHabits.map((habit) => {
              const isCompleted = habit.days && habit.days[todayIdx] === "completed";
              const time = getReminderTime(habit.name);

              return (
                <div
                  key={habit.id}
                  onClick={() => onToggleDay(habit.id, todayIdx, isCompleted ? "locked" : "completed")}
                  className={`flex items-center justify-between py-2.5 px-3.5 rounded-xl transition-all duration-300 cursor-pointer select-none ${
                    isCompleted
                      ? isDark 
                        ? "bg-emerald-950/10 text-slate-400" 
                        : "bg-emerald-50/25 text-slate-500"
                      : isDark 
                        ? "bg-slate-900 hover:bg-slate-850 text-slate-200" 
                        : "bg-slate-50/40 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Custom Checkbox */}
                    <div
                      className={`h-4.5 w-4.5 rounded-md flex items-center justify-center transition-all border shrink-0 ${
                        isCompleted
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : isDark ? "bg-slate-950 border-slate-800 text-transparent" : "bg-white border-slate-200 text-transparent"
                      }`}
                    >
                      <LucideIcon name="Check" size={10} strokeWidth={3} />
                    </div>

                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="p-1 rounded-md shrink-0"
                        style={{ backgroundColor: `${habit.color}15`, color: habit.color }}
                      >
                        <LucideIcon name={habit.iconName || "Activity"} size={11} />
                      </div>
                      <div className="flex flex-col min-w-0 leading-none">
                        <span
                          className={`text-[11px] font-bold truncate transition-all ${
                            isCompleted
                              ? "text-slate-400 line-through font-semibold"
                              : isDark ? "text-slate-200" : "text-slate-800"
                          }`}
                        >
                          {habit.name}
                        </span>
                        <span className="text-[8.5px] text-slate-400 font-mono mt-0.5">
                          {time}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button: 'OK' or Professional completion badge sticker */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {!isCompleted ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent duplicate clicks on parent div
                          onToggleDay(habit.id, todayIdx, "completed");
                        }}
                        className={`px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider transition-all duration-200 border cursor-pointer ${
                          isDark 
                            ? "bg-blue-950/40 border-blue-900/50 text-blue-400 hover:bg-blue-900 hover:text-white" 
                            : "bg-blue-50 border-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white"
                        }`}
                      >
                        OK
                      </button>
                    ) : (
                      <div className={`flex items-center gap-1 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 text-[8px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded-md border border-emerald-500/20 rotate-[-2deg] shadow-xs select-none animate-fade-in`}>
                        <LucideIcon name="CheckCircle" size={9} strokeWidth={3} className="text-emerald-500" />
                        <span>{currentMonth.substring(0, 3).toUpperCase()} {currentDay} OK</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default RightPanels;
