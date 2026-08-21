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
      <div className={`rounded-2xl sm:rounded-3xl p-4 sm:p-5 border transition-all duration-300 flex flex-col h-auto lg:h-[380px] justify-between ${
        isDark 
          ? "bg-[#1C1C1E] border-white/10 text-white shadow-sm" 
          : "bg-white border-slate-200/60 shadow-xs"
      }`}>
        {/* Header - iOS Reminders Style */}
        <div className="flex items-center justify-between mb-3.5 shrink-0">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-full ${
              isDark ? "bg-[#007AFF]/20 text-[#007AFF]" : "bg-blue-50 text-[#007AFF]"
            }`}>
              <LucideIcon name="Bell" size={14} />
            </div>
            <h4 className={`font-bold text-sm tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}>Today's Reminders</h4>
          </div>
          <span className={`text-[10px] font-bold tracking-tight px-2.5 py-0.5 rounded-full border ${
            isDark ? "bg-white/10 border-white/10 text-slate-300" : "bg-slate-100 border-slate-200/80 text-slate-600"
          }`}>
            {sortedHabits.filter(h => h.days && h.days[todayIdx] === "completed").length}/{sortedHabits.length} Done
          </span>
        </div>

        {/* Checklist Container - auto height on mobile without internal scroll */}
        <div className="flex-1 overflow-y-visible lg:overflow-y-auto pr-0 lg:pr-1 space-y-2 custom-scrollbar min-h-0">
          {sortedHabits.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <LucideIcon name="CheckCircle" size={24} className="text-blue-500 mb-2" />
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">No active habits registered.</p>
              <p className="text-[10px] text-slate-600 dark:text-slate-300 mt-0.5">Add some habits to see reminders.</p>
            </div>
          ) : (
            sortedHabits.map((habit) => {
              const isCompleted = habit.days && habit.days[todayIdx] === "completed";
              const time = getReminderTime(habit.name);

              return (
                <div
                  key={habit.id}
                  onClick={() => onToggleDay(habit.id, todayIdx, isCompleted ? "locked" : "completed")}
                  className={`flex items-center justify-between py-2.5 px-3 rounded-xl transition-all duration-200 cursor-pointer select-none border ${
                    isCompleted
                      ? isDark 
                        ? "bg-emerald-950/40 border-emerald-800 text-slate-300" 
                        : "bg-emerald-50 border-emerald-200 text-slate-700"
                      : isDark 
                        ? "bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-100" 
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Custom Checkbox */}
                    <div
                      className={`h-4.5 w-4.5 rounded-md flex items-center justify-center transition-all border shrink-0 ${
                        isCompleted
                          ? "bg-emerald-500 border-emerald-500 text-white shadow-xs"
                          : isDark ? "bg-slate-950 border-slate-700 text-transparent hover:border-blue-500" : "bg-white border-slate-300 text-transparent hover:border-blue-500"
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
                      <div className="flex flex-col min-w-0 leading-tight">
                        <span
                          className={`text-[11px] font-black truncate transition-all ${
                            isCompleted
                              ? "text-slate-500 dark:text-slate-400 line-through font-bold"
                              : isDark ? "text-white" : "text-slate-950"
                          }`}
                        >
                          {habit.name}
                        </span>
                        <span className="text-[9px] text-slate-600 dark:text-slate-300 font-bold font-mono">
                          {time}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button: 'Mark Done' or 'Completed' status */}
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {!isCompleted ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleDay(habit.id, todayIdx, "completed");
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[9.5px] font-black transition-all duration-200 border cursor-pointer ${
                          isDark 
                            ? "bg-slate-800 border-slate-700 text-slate-100 hover:bg-blue-600 hover:text-white hover:border-blue-500" 
                            : "bg-white border-slate-300 text-slate-900 hover:bg-blue-600 hover:text-white hover:border-blue-600 shadow-2xs"
                        }`}
                      >
                        Mark Done
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 text-[10px] font-black select-none">
                        <LucideIcon name="CheckCircle2" size={12} strokeWidth={2.5} className="text-emerald-500" />
                        <span>Done {currentMonth.substring(0, 3)} {currentDay}</span>
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
