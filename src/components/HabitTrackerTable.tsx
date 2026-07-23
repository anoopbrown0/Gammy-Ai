import React from "react";
import LucideIcon from "./LucideIcon";
import { Habit } from "../types";

interface HabitTrackerTableProps {
  habits: Habit[];
  onToggleDay: (habitId: string, dayIndex: number) => void;
  onLockAll?: () => void;
  onTodayClick: () => void;
  onSettingsClick: () => void;
  currentMonth: string;
  currentYear: string;
  currentDay?: number;
  onAddHabitClick?: () => void;
  onEditHabitClick?: (habit: Habit) => void;
  viewMode: "week" | "month";
  isDark?: boolean;
  onSelectDay?: (day: number) => void;
}

const isDayChangeable = (day: number, monthName: string, yearStr: string): boolean => {
  const monthsList = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const today = new Date();
  
  const cellYear = parseInt(yearStr);
  const cellMonthIdx = monthsList.indexOf(monthName);
  
  const todayYear = today.getFullYear();
  const todayMonthIdx = today.getMonth();
  const todayDay = today.getDate();
  
  return cellYear === todayYear && cellMonthIdx === todayMonthIdx && day === todayDay;
};

const isPastDate = (day: number, monthName: string, yearStr: string): boolean => {
  const monthsList = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const today = new Date();
  
  const cellYear = parseInt(yearStr);
  const cellMonthIdx = monthsList.indexOf(monthName);
  
  const todayYear = today.getFullYear();
  const todayMonthIdx = today.getMonth();
  const todayDay = today.getDate();
  
  if (cellYear < todayYear) return true;
  if (cellYear > todayYear) return false;
  
  if (cellMonthIdx < todayMonthIdx) return true;
  if (cellMonthIdx > todayMonthIdx) return false;
  
  return day < todayDay;
};

const getDaysForWeek = (day: number, monthName: string, yearStr: string): number[] => {
  try {
    const months = [
      "january", "february", "march", "april", "may", "june",
      "july", "august", "september", "october", "november", "december"
    ];
    const mIdx = months.indexOf(monthName.toLowerCase());
    if (mIdx === -1) return [20, 21, 22, 23, 24, 25, 26];
    
    const year = parseInt(yearStr);
    const date = new Date(year, mIdx, day);
    const dayOfWeek = date.getDay(); // 0 (Sun) to 6 (Sat)
    
    const dayOfWeekMondayStart = (dayOfWeek + 6) % 7;
    const startOffset = dayOfWeekMondayStart;
    let startDay = day - startOffset;
    
    if (startDay < 1) {
      startDay = 1;
    }
    if (startDay + 6 > 31) {
      startDay = 25;
    }
    
    return Array.from({ length: 7 }, (_, i) => startDay + i);
  } catch (e) {
    return [20, 21, 22, 23, 24, 25, 26];
  }
};

export const HabitTrackerTable: React.FC<HabitTrackerTableProps> = ({
  habits,
  onToggleDay,
  onLockAll,
  onTodayClick,
  onSettingsClick,
  currentMonth,
  currentYear,
  currentDay = 21,
  onAddHabitClick,
  onEditHabitClick,
  viewMode,
  isDark = false,
  onSelectDay,
}) => {
  // Generate days array (1 to 7 or 1 to 30) dynamically based on selected date
  const daysArray = viewMode === "week"
    ? getDaysForWeek(currentDay, currentMonth, currentYear)
    : Array.from({ length: 30 }, (_, i) => i + 1);

  // Dynamic mobileDays centered around the active currentDay
  const yesterdayNum = currentDay > 1 ? currentDay - 1 : 1;
  const todayNum = currentDay;
  const tomorrowNum = currentDay < 30 ? currentDay + 1 : 30;
  const mobileDays = [yesterdayNum, todayNum, tomorrowNum];

  // Helper to calculate progress percentage over the active days
  const calculateProgress = (habit: Habit) => {
    const completedCount = daysArray.filter((dayNum) => habit.days[dayNum - 1] === "completed").length;
    return Math.round((completedCount / daysArray.length) * 100);
  };

  // Helper to calculate weekday initial (e.g., 'M', 'T', 'W', etc.)
  const getWeekday = (day: number) => {
    try {
      const months = [
        "january", "february", "march", "april", "may", "june",
        "july", "august", "september", "october", "november", "december"
      ];
      const mIdx = months.indexOf(currentMonth.toLowerCase());
      if (mIdx === -1) return "";
      const date = new Date(parseInt(currentYear), mIdx, day);
      const dayStr = date.toLocaleDateString("en-US", { weekday: "short" });
      return dayStr.substring(0, 1).toUpperCase(); // First character of weekday e.g. "M", "T"
    } catch (e) {
      return "";
    }
  };

  // Helper to format full human-readable date for tooltips
  const getFullFormattedDate = (day: number) => {
    try {
      const months = [
        "january", "february", "march", "april", "may", "june",
        "july", "august", "september", "october", "november", "december"
      ];
      const mIdx = months.indexOf(currentMonth.toLowerCase());
      if (mIdx === -1) return `Day ${day}`;
      const date = new Date(parseInt(currentYear), mIdx, day);
      return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    } catch (e) {
      return `Day ${day}`;
    }
  };

  return (
    <div 
      id="sabit-habit-tracker-container"
      className={`rounded-2xl p-6 border transition-all duration-300 ${
        isDark 
          ? "bg-slate-900 border-slate-800 text-white shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)]" 
          : "bg-white border-[#E5E7EB] shadow-[0_4px_20px_rgba(15,23,42,0.03)] hover:shadow-[0_8px_30px_rgba(15,23,42,0.06)]"
      }`}
    >
      {/* Tracker Header controls */}
      <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b mb-5 ${
        isDark ? "border-slate-800" : "border-[#E5E7EB]"
      }`}>
        <div>
          <h4 className={`font-bold text-xs tracking-tight ${isDark ? "text-slate-100" : "text-[#0F172A]"}`}>Active Habits Ledger</h4>
          <p className={`${isDark ? "text-slate-400" : "text-[#64748B]"} text-[10px] font-medium uppercase tracking-wider mt-0.5`}>
            {currentMonth} {currentYear} • Daily Action Registry
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2">
          {onAddHabitClick && (
            <button
              id="tracker-add-habit-btn"
              onClick={onAddHabitClick}
              className="h-8 px-3.5 bg-gradient-to-r from-[#2563EB] to-[#7C3AED] text-white rounded-xl text-[10px] font-bold shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1 cursor-pointer"
            >
              <LucideIcon name="Plus" size={11} strokeWidth={2.5} />
              <span>Add Habit</span>
            </button>
          )}

          <button
            id="tracker-today-btn"
            onClick={onTodayClick}
            className={`h-8 px-3.5 border rounded-xl text-[10px] font-bold shadow-sm active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer ${
              isDark 
                ? "bg-slate-850 border-slate-700 text-slate-200 hover:bg-slate-800" 
                : "bg-white border-[#E5E7EB] text-slate-700 hover:bg-slate-50"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB] animate-pulse" />
            <span>Today</span>
          </button>
          
          <button
            id="tracker-settings-btn"
            onClick={onSettingsClick}
            className={`h-8 px-3.5 border rounded-xl text-[10px] font-bold shadow-sm active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer ${
              isDark 
                ? "bg-slate-850 border-slate-700 text-slate-200 hover:bg-slate-800" 
                : "bg-white border-[#E5E7EB] text-slate-700 hover:bg-slate-50"
            }`}
          >
            <LucideIcon name="Settings" size={11} className="text-slate-400 animate-spin-slow" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Main Grid Wrapper for responsive horizontal scrolling on narrow viewports - Desktop & Tablet */}
      <div className="hidden md:block overflow-x-auto custom-scrollbar -mx-6 px-6 scroll-smooth">
        <div className={`select-none transition-all duration-300 ${viewMode === "month" ? "min-w-[1450px]" : "min-w-[1050px]"}`}>
          {/* Grid Header Columns */}
          <div className={`grid grid-cols-[240px_1fr_120px_100px] items-center text-[10px] font-semibold uppercase tracking-wider text-[#64748B] pb-3 border-b ${
            isDark ? "border-slate-850" : "border-slate-100"
          }`}>
            <div className={`sticky left-0 z-20 pr-4 pl-3 py-1 font-bold ${
              isDark ? "bg-slate-900 text-slate-100" : "bg-white text-[#0F172A]"
            }`}>
              Habit Identity
            </div>
            <div className="flex items-center justify-between px-4">
              <span className="text-[9px] text-left">{daysArray.length} Days Checklist</span>
              <span className="text-[9px] text-right font-mono text-slate-400">{currentMonth.toUpperCase()}</span>
            </div>
            <div className="text-center">Progress</div>
            <div className="text-right pr-4">Streak</div>
          </div>

          {/* Calendar Day/Date Header Row */}
          <div className={`grid grid-cols-[240px_1fr_120px_100px] items-center py-2.5 border-b rounded-xl my-1.5 text-[8px] font-bold ${
            isDark 
              ? "bg-slate-950/40 border-slate-850 text-slate-400" 
              : "bg-slate-50/50 border-slate-100 text-slate-500"
          }`}>
            <div className={`sticky left-0 z-20 pl-3 pr-4 h-full flex items-center font-extrabold ${
              isDark 
                ? "bg-slate-900 text-slate-400" 
                : "bg-white text-slate-500"
            }`}>
              HABIT DETAILS
            </div>
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-1.5 w-full justify-between animate-fade-in" key={viewMode}>
                {daysArray.map((dayNum) => {
                  const dayChar = getWeekday(dayNum);
                  const isToday = dayNum === currentDay;
                  return (
                    <div 
                      key={dayNum} 
                      onClick={() => onSelectDay?.(dayNum)}
                      className={`flex flex-col items-center justify-center w-6 text-center p-0.5 rounded-md cursor-pointer transition-all hover:scale-110 ${
                        isToday 
                          ? isDark ? "bg-blue-950/45 ring-1 ring-blue-500/50 font-black" : "bg-blue-100/70 ring-1 ring-blue-300 font-black" 
                          : isDark ? "hover:bg-slate-800 text-slate-300" : "hover:bg-slate-200/60 text-slate-700"
                      }`}
                      title={`${currentMonth} ${dayNum}, ${currentYear}${isToday ? " (Selected Focus)" : " - Click to set as active"}`}
                    >
                      <span className={`text-[7px] font-extrabold uppercase ${isToday ? "text-blue-500" : "text-slate-400"}`}>{dayChar}</span>
                      <span className={`text-[9px] font-extrabold font-mono mt-0.5 ${
                        isToday 
                          ? "text-blue-600 dark:text-blue-400 font-black scale-105" 
                          : isDark ? "text-slate-300" : "text-slate-700"
                      }`}>{dayNum}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="text-center font-bold">INTERVAL PROGRESS</div>
            <div className="text-right pr-4 font-bold">STREAK</div>
          </div>

          {/* Habit Rows */}
          <div className={`divide-y ${isDark ? "divide-slate-850" : "divide-[#E5E7EB]"}`}>
            {habits.map((habit) => {
              const progressPercentage = calculateProgress(habit);
              return (
                <div
                  key={habit.id}
                  id={`habit-row-${habit.id}`}
                  className={`grid grid-cols-[240px_1fr_120px_100px] items-center py-1.5 group rounded-xl transition-colors duration-150 ${
                    isDark ? "hover:bg-slate-850/40" : "hover:bg-slate-50/40"
                  }`}
                >
                  {/* Column 1: Habit Info (Sticky & Clickable) */}
                  <div 
                    onClick={() => onEditHabitClick?.(habit)}
                    className={`sticky left-0 z-20 pr-4 pl-3 py-1.5 flex items-center gap-2.5 min-w-[240px] max-w-[240px] cursor-pointer rounded-l-xl transition-all duration-150 ${
                      isDark 
                        ? "bg-slate-900 group-hover:bg-slate-800 text-white" 
                        : "bg-white group-hover:bg-slate-50 text-slate-800"
                    } shadow-[4px_0_8px_-4px_rgba(0,0,0,0.12)]`}
                  >
                    <div
                      className="p-1 rounded-lg shrink-0 transition-transform group-hover:scale-105 shadow-sm border"
                      style={{
                        backgroundColor: `${habit.color}15`,
                        color: habit.color,
                        borderColor: `${habit.color}25`,
                      }}
                    >
                      <LucideIcon name={habit.iconName} size={13} strokeWidth={2.2} />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-1 min-w-0">
                        <span className={`text-xs font-bold tracking-tight truncate transition-colors group-hover:text-blue-500 ${
                          isDark ? "text-slate-100" : "text-[#0F172A]"
                        }`}>
                          {habit.name}
                        </span>
                        {onEditHabitClick && (
                          <span className="p-0.5 rounded-md text-slate-400 opacity-0 group-hover:opacity-100 transition-all duration-150">
                            <LucideIcon name="Pencil" size={9} />
                          </span>
                        )}
                      </div>
                      
                      {/* Target Goal details */}
                      <span className={`text-[9px] font-bold truncate mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        Goal: {habit.goal}
                      </span>
                    </div>

                    {/* Desktop Hover Tooltip */}
                    <div className="absolute hidden md:group-hover/habit-cell:flex items-center gap-1.5 left-full ml-2.5 top-1/2 -translate-y-1/2 bg-[#0F172A] border border-slate-800 text-white text-[9px] font-semibold py-1 px-2.5 rounded-lg pointer-events-none transition-all duration-150 shadow-xl z-40 whitespace-nowrap">
                      <LucideIcon name="Target" size={10} className="text-amber-400" />
                      <span>your daily target: <span className="text-blue-400 font-bold">{habit.goal}</span></span>
                    </div>
                  </div>

                  {/* Column 2: Day Indicators Grid (dynamic based on viewMode) */}
                  <div className="flex items-center justify-between px-4">
                    <div className="flex items-center gap-1.5 w-full justify-between animate-fade-in" key={viewMode}>
                      {daysArray.map((dayNum) => {
                        const status = habit.days[dayNum - 1] || "locked";
                        const fullDateStr = getFullFormattedDate(dayNum);
                        const isToday = dayNum === currentDay;
                        const canChange = isDayChangeable(dayNum, currentMonth, currentYear);
                        const isPast = isPastDate(dayNum, currentMonth, currentYear);
                        
                        return (
                          <div
                            key={dayNum}
                            onClick={() => {
                              if (canChange) {
                                onToggleDay(habit.id, dayNum - 1);
                              }
                            }}
                            className={`relative group/indicator w-6 h-6 flex items-center justify-center p-0.5 rounded-md transition-all ${
                              isToday 
                                ? isDark ? "bg-blue-950/20 ring-1 ring-blue-800/30 font-black" : "bg-blue-50/40 ring-1 ring-blue-200/50 font-black" 
                                : ""
                            } ${
                              canChange 
                                ? "cursor-pointer" 
                                : "cursor-not-allowed opacity-60"
                            }`}
                            title={`${fullDateStr} - ${status.toUpperCase()}${isToday ? " (Today - Click to toggle)" : isPast ? " (Past date - Locked)" : " (Future date - Locked)"}`}
                          >
                            {/* Inner Circle Indicator */}
                            <div
                              className={`h-5 w-5 rounded-full flex items-center justify-center transition-all duration-150 border ${
                                !canChange ? "" : "hover:scale-115 active:scale-90"
                              } ${
                                status === "completed"
                                  ? "text-white border-transparent shadow-[0_2px_8px_rgba(15,23,42,0.1)]"
                                  : status === "skipped"
                                  ? "bg-white border-dashed text-transparent hover:bg-slate-50"
                                  : isDark 
                                    ? "bg-slate-950 border-slate-800 text-slate-700" 
                                    : "bg-slate-50/80 border-[#E5E7EB] text-slate-300"
                              }`}
                              style={{
                                backgroundColor: status === "completed" ? habit.color : undefined,
                                borderColor: status === "skipped" ? habit.color : undefined,
                              }}
                            >
                              {status === "completed" ? (
                                <span className="text-[8px] font-extrabold font-sans">✓</span>
                              ) : status === "skipped" ? (
                                <span className="text-[8px] font-extrabold" style={{ color: habit.color }}>•</span>
                              ) : (
                                <LucideIcon name="Lock" size={8} strokeWidth={2.5} className={isDark ? "text-slate-800" : "text-slate-300"} />
                              )}
                            </div>

                            {/* Floating Day Tooltip */}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 scale-0 group-hover/indicator:scale-100 bg-[#0F172A] text-white text-[9px] font-semibold py-1 px-1.5 rounded pointer-events-none transition-all duration-100 shadow-md z-30 whitespace-nowrap">
                              {fullDateStr}: {status.toUpperCase()}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Column 3: Progress Percentage */}
                  <div className="px-3">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <div className={`h-1.5 w-full rounded-full overflow-hidden border ${
                        isDark ? "bg-slate-800 border-slate-700" : "bg-slate-100/60 border-[#E5E7EB]"
                      }`}>
                        <div
                          className="h-full rounded-full transition-all duration-500 ease-out"
                          style={{
                            width: `${progressPercentage}%`,
                            background: `linear-gradient(to right, ${habit.color}B0, ${habit.color})`,
                          }}
                        />
                      </div>
                      <span className={`text-[9px] font-bold font-mono ${isDark ? "text-slate-400" : "text-[#64748B]"}`}>
                        {progressPercentage}% Completed
                      </span>
                    </div>
                  </div>

                  {/* Column 4: Streak Counter */}
                  <div className="text-right pr-4 flex items-center justify-end gap-1.5">
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border shadow-sm transition-transform group-hover:scale-105 ${
                      isDark 
                        ? "bg-amber-950/30 border-amber-900/60 text-amber-500" 
                        : "bg-amber-50 border-amber-100 text-[#D97706]"
                    }`}>
                      <LucideIcon name="Flame" size={12} className="animate-pulse" />
                      <span className="text-[10px] font-extrabold font-mono leading-none">
                        {habit.streak}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Optimized Mobile Stream View (Visible on screens < md) */}
      <div className="block md:hidden space-y-3.5 select-none animate-fade-in">
        {/* Header Guide Label */}
        <div className={`flex items-center justify-between px-3 py-2 rounded-xl text-[9px] font-extrabold tracking-wider border uppercase ${
          isDark 
            ? "bg-slate-950/40 border-slate-800/20 text-slate-400" 
            : "bg-slate-50/50 border-slate-100 text-slate-500"
        }`}>
          <span>Habit Registry</span>
          <div className="flex items-center gap-3 text-right font-mono">
            <button 
              onClick={() => onSelectDay?.(yesterdayNum)}
              className={`w-[48px] text-center cursor-pointer transition-all hover:text-blue-500 ${
                currentDay === yesterdayNum ? "text-blue-500 font-black scale-105" : "text-slate-400"
              }`}
            >
              Yest ({yesterdayNum})
            </button>
            <button 
              onClick={() => onSelectDay?.(todayNum)}
              className={`w-[48px] text-center cursor-pointer transition-all hover:text-blue-500 ${
                currentDay === todayNum ? "text-blue-500 font-black scale-105" : "text-slate-400"
              }`}
            >
              Active ({todayNum})
            </button>
            <button 
              onClick={() => onSelectDay?.(tomorrowNum)}
              className={`w-[48px] text-center cursor-pointer transition-all hover:text-blue-500 ${
                currentDay === tomorrowNum ? "text-blue-500 font-black scale-105" : "text-slate-400"
              }`}
            >
              Tom ({tomorrowNum})
            </button>
          </div>
        </div>

        {/* Mobile Habits Unified Card */}
        <div className={`rounded-2xl overflow-hidden shadow-xs divide-y ${
          isDark 
            ? "bg-slate-900/60 border-0 divide-slate-800/30" 
            : "bg-white border border-slate-150 divide-slate-100/80"
        }`}>
          {habits.map((habit) => {
            const progressPercentage = calculateProgress(habit);
            // mobileDays is defined in outer component scope now!
            
            return (
              <div
                key={habit.id}
                className={`p-4 flex flex-col gap-3.5 transition-colors duration-200 ${
                  isDark ? "hover:bg-slate-850/20" : "hover:bg-slate-50/40"
                }`}
              >
                {/* Upper Deck: Info & Momentum */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0" onClick={() => onEditHabitClick?.(habit)}>
                    <div
                      className="p-1.5 rounded-lg shrink-0 border"
                      style={{
                        backgroundColor: `${habit.color}15`,
                        color: habit.color,
                        borderColor: `${habit.color}25`,
                      }}
                    >
                      <LucideIcon name={habit.iconName} size={13} strokeWidth={2.4} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1">
                        <span className={`text-xs font-black tracking-tight truncate ${
                          isDark ? "text-slate-100" : "text-[#0F172A]"
                        }`}>
                          {habit.name}
                        </span>
                        <LucideIcon name="Pencil" size={8} className="text-slate-400 opacity-60" />
                      </div>
                      {/* Daily target in small under the habit title */}
                      <span className={`text-[9px] font-bold mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        {habit.goal}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Flame Streak */}
                    <div className={`flex items-center gap-0.5 px-2 py-0.5 rounded-lg border text-[9px] font-black font-mono leading-none ${
                      isDark 
                        ? "bg-amber-950/20 border-amber-900/40 text-amber-500" 
                        : "bg-amber-50 border-amber-100 text-amber-600"
                    }`}>
                      <LucideIcon name="Flame" size={10} className="animate-pulse" />
                      <span>{habit.streak}</span>
                    </div>
                    {/* Percentage Progress */}
                    <span className={`text-[9px] font-bold font-mono ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      {progressPercentage}%
                    </span>
                  </div>
                </div>

                {/* Progress Mini Line */}
                <div className={`h-1 w-full rounded-full overflow-hidden ${
                  isDark ? "bg-slate-850" : "bg-slate-100/70"
                }`}>
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${progressPercentage}%`,
                      background: `linear-gradient(to right, ${habit.color}A0, ${habit.color})`,
                    }}
                  />
                </div>

                {/* Lower Deck: Touch-optimized checklist ticks (Yesterday, Today, Tomorrow) */}
                <div className="flex items-center justify-between pt-1">
                  <span className={`text-[9px] font-extrabold uppercase tracking-widest ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    Tap to update:
                  </span>
                  <div className="flex items-center gap-6">
                    {mobileDays.map((dayNum) => {
                      const status = habit.days[dayNum - 1] || "locked";
                      const canChange = isDayChangeable(dayNum, currentMonth, currentYear);
                      
                      return (
                        <button
                          key={dayNum}
                          onClick={() => {
                            if (canChange) {
                              onToggleDay(habit.id, dayNum - 1);
                            }
                          }}
                          disabled={!canChange}
                          className={`flex items-center justify-center p-1.5 rounded-full select-none focus:outline-none ${
                            !canChange 
                              ? "cursor-not-allowed opacity-40 grayscale-[20%]" 
                              : "transition-transform active:scale-90 cursor-pointer hover:scale-105"
                          }`}
                          style={{ minWidth: "44px", minHeight: "44px" }}
                          title={canChange ? `Day ${dayNum} - Tap to log today` : `Day ${dayNum} - Locked`}
                        >
                          <div
                            className={`h-6.5 w-6.5 rounded-full flex items-center justify-center transition-all duration-150 border-2 text-[10px] ${
                              status === "completed"
                                ? "text-white border-transparent shadow-[0_2px_6px_rgba(0,0,0,0.1)]"
                                : status === "skipped"
                                ? "bg-transparent border-dashed"
                                : isDark 
                                  ? "bg-slate-950 border-slate-800 text-slate-850" 
                                  : "bg-slate-50 border-slate-200 text-slate-300"
                            }`}
                            style={{
                              backgroundColor: status === "completed" ? habit.color : undefined,
                              borderColor: status === "skipped" ? habit.color : undefined,
                            }}
                          >
                            {status === "completed" ? (
                              <span className="font-black">✓</span>
                            ) : status === "skipped" ? (
                              <span className="font-bold" style={{ color: habit.color }}>•</span>
                            ) : (
                              <LucideIcon name="Lock" size={9} strokeWidth={2.8} className={isDark ? "text-slate-800" : "text-slate-400/80"} />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HabitTrackerTable;
