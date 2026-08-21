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
  
  if (cellYear < todayYear) return true;
  if (cellYear > todayYear) return false;
  if (cellMonthIdx < todayMonthIdx) return true;
  if (cellMonthIdx > todayMonthIdx) return false;
  
  return day <= todayDay;
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

const getDaysInMonth = (monthName: string, yearStr: string): number => {
  const months = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december"
  ];
  const mIdx = months.indexOf(monthName.toLowerCase());
  const year = parseInt(yearStr, 10);
  if (mIdx === -1 || isNaN(year)) return 31;
  return new Date(year, mIdx + 1, 0).getDate();
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
  // Ref for horizontal scrolling container and active day centering
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const activeDayRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollContainerRef.current && activeDayRef.current) {
        const container = scrollContainerRef.current;
        const activeEl = activeDayRef.current;
        const containerWidth = container.clientWidth;
        const activeLeft = activeEl.offsetLeft;
        const activeWidth = activeEl.clientWidth;
        
        const targetScrollLeft = activeLeft - (containerWidth / 2) + (activeWidth / 2);
        container.scrollTo({
          left: Math.max(0, targetScrollLeft),
          behavior: "smooth"
        });
      }
    }, 120);
    return () => clearTimeout(timer);
  }, [currentDay, viewMode, habits.length]);

  // Generate days array (1 to 7 or full month days 28-31) dynamically based on selected date
  const totalMonthDays = getDaysInMonth(currentMonth, currentYear);
  const daysArray = viewMode === "week"
    ? getDaysForWeek(currentDay, currentMonth, currentYear)
    : Array.from({ length: totalMonthDays }, (_, i) => i + 1);

  // Dynamic mobileDays centered around the active currentDay (guaranteed unique)
  const yesterdayNum = currentDay > 1 ? currentDay - 1 : 1;
  const todayNum = currentDay;
  const tomorrowNum = currentDay < 31 ? currentDay + 1 : 31;
  const mobileDays = Array.from(new Set([yesterdayNum, todayNum, tomorrowNum]));

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
      className={`rounded-2xl sm:rounded-3xl p-5 sm:p-6 border transition-all duration-300 ${
        isDark 
          ? "bg-[#1C1C1E] border-white/10 text-white shadow-sm" 
          : "bg-white border-slate-200/60 shadow-xs"
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
      <div ref={scrollContainerRef} className="hidden md:block overflow-x-auto custom-scrollbar -mx-6 px-6 scroll-smooth">
        <div className={`select-none transition-all duration-300 ${viewMode === "month" ? "min-w-[1450px]" : "min-w-[1050px]"}`}>
          {/* Grid Header Columns */}
          <div className={`grid grid-cols-[240px_1fr_120px_100px] items-center text-[10px] font-black uppercase tracking-wider pb-3 border-b ${
            isDark ? "border-slate-800 text-slate-200" : "border-slate-200 text-slate-800"
          }`}>
            <div className={`sticky left-0 z-20 pr-4 pl-3 py-1 font-black ${
              isDark ? "bg-slate-900 text-white" : "bg-white text-slate-950"
            }`}>
              Habit Identity
            </div>
            <div className="flex items-center justify-between px-4">
              <span className="text-[10px] font-black text-left">{daysArray.length} Days Checklist</span>
              <span className="text-[10px] text-right font-black font-mono text-blue-600 dark:text-blue-400">{currentMonth.toUpperCase()}</span>
            </div>
            <div className="text-center font-black">Progress</div>
            <div className="text-right pr-4 font-black">Streak</div>
          </div>

          {/* Calendar Day/Date Header Row */}
          <div className={`grid grid-cols-[240px_1fr_120px_100px] items-center py-2.5 border-b rounded-xl my-1.5 text-[9px] font-black ${
            isDark 
              ? "bg-slate-950 border-slate-800 text-slate-300" 
              : "bg-slate-100/90 border-slate-200 text-slate-800"
          }`}>
            <div className={`sticky left-0 z-20 pl-3 pr-4 h-full flex items-center font-black ${
              isDark 
                ? "bg-slate-900 text-slate-200" 
                : "bg-white text-slate-800"
            }`}>
              HABIT DETAILS
            </div>
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-1.5 w-full justify-between animate-fade-in" key={viewMode}>
                {daysArray.map((dayNum, dayIdx) => {
                  const dayChar = getWeekday(dayNum);
                  const isToday = dayNum === currentDay;
                  return (
                    <div 
                      key={`hdr-day-${dayNum}-${dayIdx}`} 
                      ref={isToday ? activeDayRef : undefined}
                      onClick={() => onSelectDay?.(dayNum)}
                      className={`flex flex-col items-center justify-center w-6 text-center p-0.5 rounded-md cursor-pointer transition-all hover:scale-110 ${
                        isToday 
                          ? isDark ? "bg-blue-950 ring-1 ring-blue-500 font-black" : "bg-blue-100 ring-1 ring-blue-400 font-black" 
                          : isDark ? "hover:bg-slate-800 text-slate-200" : "hover:bg-slate-200 text-slate-900"
                      }`}
                      title={`${currentMonth} ${dayNum}, ${currentYear}${isToday ? " (Selected Focus)" : " - Click to set as active"}`}
                    >
                      <span className={`text-[8px] font-black uppercase ${isToday ? "text-blue-500 dark:text-blue-400" : isDark ? "text-slate-400" : "text-slate-600"}`}>{dayChar}</span>
                      <span className={`text-[10px] font-black font-mono mt-0.5 ${
                        isToday 
                          ? "text-blue-600 dark:text-blue-400 font-black scale-105" 
                          : isDark ? "text-slate-100" : "text-slate-950"
                      }`}>{dayNum}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="text-center font-black">INTERVAL PROGRESS</div>
            <div className="text-right pr-4 font-black">STREAK</div>
          </div>

          {/* Habit Rows */}
          <div className={`divide-y ${isDark ? "divide-slate-850" : "divide-[#E5E7EB]"}`}>
            {habits.length === 0 ? (
              <div className="py-12 px-4 flex flex-col items-center justify-center text-center">
                <div className={`p-4 rounded-2xl mb-3 border ${
                  isDark ? "bg-slate-900 border-slate-800 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-500"
                }`}>
                  <LucideIcon name="Target" size={28} className="text-blue-500 animate-pulse" />
                </div>
                <h3 className={`text-sm font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                  No Habits Created Yet
                </h3>
                <p className={`text-xs max-w-sm mt-1 mb-4 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Your habit ledger is completely empty. Start tracking your daily goals by adding your first habit!
                </p>
                <button
                  onClick={onAddHabitClick}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <LucideIcon name="Plus" size={14} />
                  <span>Add Your First Habit</span>
                </button>
              </div>
            ) : (
              habits.map((habit) => {
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
                      <span className={`text-[10px] font-black truncate mt-0.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                        Goal: {habit.goal}
                      </span>
                    </div>

                    {/* Desktop Hover Tooltip */}
                    <div className="absolute hidden md:group-hover/habit-cell:flex items-center gap-1.5 left-full ml-2.5 top-1/2 -translate-y-1/2 bg-[#0F172A] border border-slate-700 text-white text-[10px] font-bold py-1 px-2.5 rounded-lg pointer-events-none transition-all duration-150 shadow-xl z-40 whitespace-nowrap">
                      <LucideIcon name="Target" size={10} className="text-amber-400" />
                      <span>your daily target: <span className="text-blue-400 font-black">{habit.goal}</span></span>
                    </div>
                  </div>

                  {/* Column 2: Day Indicators Grid (dynamic based on viewMode) */}
                  <div className="flex items-center justify-between px-4">
                    <div className="flex items-center gap-1.5 w-full justify-between animate-fade-in" key={viewMode}>
                      {daysArray.map((dayNum, dayIdx) => {
                        const status = habit.days[dayNum - 1] || "locked";
                        const fullDateStr = getFullFormattedDate(dayNum);
                        const isToday = dayNum === currentDay;
                        const canChange = isDayChangeable(dayNum, currentMonth, currentYear);
                        const isPast = isPastDate(dayNum, currentMonth, currentYear);
                        
                        return (
                          <div
                            key={`ind-day-${dayNum}-${dayIdx}`}
                            onClick={() => {
                              if (canChange) {
                                onToggleDay(habit.id, dayNum - 1);
                              }
                            }}
                            className={`relative group/indicator w-6 h-6 flex items-center justify-center p-0.5 rounded-md transition-all ${
                              isToday 
                                ? isDark ? "bg-blue-950/40 ring-1 ring-blue-500 font-black" : "bg-blue-100/80 ring-1 ring-blue-400 font-black" 
                                : ""
                            } ${
                              canChange 
                                ? "cursor-pointer" 
                                : "cursor-not-allowed"
                            }`}
                            title={`${fullDateStr} - ${status.toUpperCase()}${isToday ? " (Today - Click to toggle)" : isPast ? " (Past date - Locked)" : " (Future date - Locked)"}`}
                          >
                            {/* Inner Circle Indicator */}
                            <div
                              className={`h-5 w-5 rounded-full flex items-center justify-center transition-all duration-150 ${
                                status === "completed"
                                  ? "opacity-100 shadow-sm border-0"
                                  : "opacity-70 border-[0.75px]"
                              } ${
                                !canChange ? "" : "hover:scale-115 active:scale-90"
                              }`}
                              style={{
                                backgroundColor: status === "completed" ? habit.color : undefined,
                                borderColor: status === "skipped" ? habit.color : (isDark ? "rgba(148, 163, 184, 0.35)" : "rgba(100, 116, 139, 0.4)"),
                              }}
                            >
                              {status === "completed" ? (
                                <span className="text-[10px] font-black font-sans text-white drop-shadow-xs">✓</span>
                              ) : status === "skipped" ? (
                                <span className="text-[9px] font-black" style={{ color: habit.color }}>•</span>
                              ) : (
                                <LucideIcon name="Lock" size={7.5} strokeWidth={1.5} className={isDark ? "text-slate-600" : "text-slate-400"} />
                              )}
                            </div>

                            {/* Floating Day Tooltip */}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 scale-0 group-hover/indicator:scale-100 bg-[#0F172A] text-white text-[10px] font-bold py-1 px-1.5 rounded pointer-events-none transition-all duration-100 shadow-md z-30 whitespace-nowrap">
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
                      <div className={`h-2 w-full rounded-full overflow-hidden border ${
                        isDark ? "bg-slate-800 border-slate-700" : "bg-slate-200 border-slate-300"
                      }`}>
                        <div
                          className="h-full rounded-full transition-all duration-500 ease-out"
                          style={{
                            width: `${progressPercentage}%`,
                            background: `linear-gradient(to right, ${habit.color}B0, ${habit.color})`,
                          }}
                        />
                      </div>
                      <span className={`text-[10px] font-black font-mono ${isDark ? "text-slate-200" : "text-slate-900"}`}>
                        {progressPercentage}% Completed
                      </span>
                    </div>
                  </div>

                  {/* Column 4: Streak Counter */}
                  <div className="text-right pr-4 flex items-center justify-end gap-1.5">
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border shadow-sm transition-transform group-hover:scale-105 ${
                      isDark 
                        ? "bg-amber-950/40 border-amber-800 text-amber-400" 
                        : "bg-amber-100 border-amber-300 text-amber-900"
                    }`}>
                      <LucideIcon name="Zap" size={13} className="animate-pulse" strokeWidth={2.4} />
                      <span className="text-[11px] font-black font-mono leading-none">
                        {habit.streak}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
            )}
          </div>
        </div>
      </div>

      {/* Optimized Mobile Stream View (Visible on screens < md) */}
      <div className="block md:hidden space-y-3.5 select-none animate-fade-in">
        {/* Header Guide Label */}
        <div className={`flex items-center justify-between px-3 py-2 rounded-xl text-[10px] font-black tracking-wider border uppercase ${
          isDark 
            ? "bg-slate-950 border-slate-850 text-slate-300" 
            : "bg-slate-100 border-slate-200 text-slate-800"
        }`}>
          <span>Habit Registry</span>
          <div className="flex items-center gap-3 text-right font-mono">
            <button 
              onClick={() => onSelectDay?.(yesterdayNum)}
              className={`w-[48px] text-center cursor-pointer transition-all hover:text-blue-500 ${
                currentDay === yesterdayNum ? "text-blue-600 dark:text-blue-400 font-black scale-105" : "text-slate-700 dark:text-slate-300 font-bold"
              }`}
            >
              Yest ({yesterdayNum})
            </button>
            <button 
              onClick={() => onSelectDay?.(todayNum)}
              className={`w-[48px] text-center cursor-pointer transition-all hover:text-blue-500 ${
                currentDay === todayNum ? "text-blue-600 dark:text-blue-400 font-black scale-105" : "text-slate-700 dark:text-slate-300 font-bold"
              }`}
            >
              Active ({todayNum})
            </button>
            <button 
              onClick={() => onSelectDay?.(tomorrowNum)}
              className={`w-[48px] text-center cursor-pointer transition-all hover:text-blue-500 ${
                currentDay === tomorrowNum ? "text-blue-600 dark:text-blue-400 font-black scale-105" : "text-slate-700 dark:text-slate-300 font-bold"
              }`}
            >
              Tom ({tomorrowNum})
            </button>
          </div>
        </div>

        {/* Mobile Habits Unified Card */}
        <div className={`rounded-2xl overflow-hidden shadow-xs divide-y ${
          isDark 
            ? "bg-slate-900/90 border border-slate-800 divide-slate-800" 
            : "bg-white border border-slate-200 divide-slate-100"
        }`}>
          {habits.length === 0 ? (
            <div className="py-8 px-4 flex flex-col items-center justify-center text-center">
              <LucideIcon name="Target" size={24} className="text-blue-500 mb-2 animate-pulse" />
              <h4 className={`text-xs font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                No Habits Tracked
              </h4>
              <p className={`text-[11px] mt-0.5 mb-3 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                Tap below to create your first habit!
              </p>
              <button
                onClick={onAddHabitClick}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <LucideIcon name="Plus" size={13} />
                <span>Add Habit</span>
              </button>
            </div>
          ) : (
            habits.map((habit) => {
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
                      <span className={`text-[10px] font-black mt-0.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                        {habit.goal}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Zap Streak */}
                    <div className={`flex items-center gap-0.5 px-2 py-0.5 rounded-lg border text-[9px] font-black font-mono leading-none ${
                      isDark 
                        ? "bg-amber-950/40 border-amber-800 text-amber-400" 
                        : "bg-amber-100 border-amber-300 text-amber-900"
                    }`}>
                      <LucideIcon name="Zap" size={10} className="animate-pulse" />
                      <span>{habit.streak}</span>
                    </div>
                    {/* Percentage Progress */}
                    <span className={`text-[10px] font-black font-mono ${isDark ? "text-slate-200" : "text-slate-900"}`}>
                      {progressPercentage}%
                    </span>
                  </div>
                </div>

                {/* Progress Mini Line */}
                <div className={`h-1.5 w-full rounded-full overflow-hidden ${
                  isDark ? "bg-slate-800" : "bg-slate-200"
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
                  <span className={`text-[10px] font-black uppercase tracking-wider ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                    Tap to update:
                  </span>
                  <div className="flex items-center gap-6">
                    {mobileDays.map((dayNum, dayIdx) => {
                      const status = habit.days[dayNum - 1] || "locked";
                      const canChange = isDayChangeable(dayNum, currentMonth, currentYear);
                      
                      return (
                        <button
                          key={`mob-btn-${dayNum}-${dayIdx}`}
                          onClick={() => {
                            if (canChange) {
                              onToggleDay(habit.id, dayNum - 1);
                            }
                          }}
                          disabled={!canChange}
                          className={`flex items-center justify-center p-1.5 rounded-full select-none focus:outline-none ${
                            !canChange 
                              ? "cursor-not-allowed grayscale-[20%]" 
                              : "transition-transform active:scale-90 cursor-pointer hover:scale-105"
                          }`}
                          style={{ minWidth: "44px", minHeight: "44px" }}
                          title={canChange ? `Day ${dayNum} - Tap to log today` : `Day ${dayNum} - Locked`}
                        >
                          <div
                            className={`h-6.5 w-6.5 rounded-full flex items-center justify-center transition-all duration-150 text-[10px] ${
                              status === "completed"
                                ? "opacity-100 text-white border-0 shadow-md scale-105"
                                : status === "skipped"
                                ? "opacity-70 bg-transparent border-[0.75px] border-dashed"
                                : isDark 
                                  ? "opacity-70 bg-slate-950 border-[0.75px] border-slate-800 text-slate-850" 
                                  : "opacity-70 bg-slate-50 border-[0.75px] border-slate-300 text-slate-400"
                            }`}
                            style={{
                              backgroundColor: status === "completed" ? habit.color : undefined,
                              borderColor: status === "skipped" ? habit.color : undefined,
                            }}
                          >
                            {status === "completed" ? (
                              <span className="font-black drop-shadow-xs">✓</span>
                            ) : status === "skipped" ? (
                              <span className="font-bold" style={{ color: habit.color }}>•</span>
                            ) : (
                              <LucideIcon name="Lock" size={8} strokeWidth={1.5} className={isDark ? "text-slate-800" : "text-slate-400/80"} />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
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

export default HabitTrackerTable;
