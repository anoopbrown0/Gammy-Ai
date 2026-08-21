import React, { useState, useRef, useEffect, useId } from "react";
import LucideIcon from "./LucideIcon";
import { Habit } from "../types";

interface ProgressChartProps {
  habits: Habit[];
  currentMonth: string;
  currentYear: string;
  currentDay?: number;
  viewMode: "week" | "month";
  onViewModeChange: (mode: "week" | "month") => void;
  isDark?: boolean;
  selectedHabitId: string;
  onSelectedHabitIdChange: (id: string) => void;
  onSelectDay?: (day: number) => void;
}

interface MoodExpression {
  emoji: string;
  title: string;
  desc: string;
  colorClass: string;
  badgeClass: string;
}

const getExpression = (rate: number, isDark?: boolean): MoodExpression => {
  if (rate >= 95) {
    return {
      emoji: "⚡",
      title: "Superhuman Legend",
      desc: "Pure mastery! You are executing your habits flawlessly.",
      colorClass: "text-rose-600",
      badgeClass: isDark ? "bg-rose-950/40 border-rose-900/60 text-rose-300" : "bg-rose-50 border-rose-100 text-rose-700"
    };
  }
  if (rate >= 80) {
    return {
      emoji: "🔥",
      title: "Unstoppable Flow",
      desc: "Excellent momentum! Consistency is reaching legendary heights.",
      colorClass: "text-amber-500",
      badgeClass: isDark ? "bg-amber-950/40 border-amber-900/60 text-amber-300" : "bg-amber-50 border-amber-100 text-amber-700"
    };
  }
  if (rate >= 60) {
    return {
      emoji: "🎯",
      title: "Focused Hustler",
      desc: "Solid daily routine. Maintain this focus to unlock new streaks!",
      colorClass: "text-emerald-500",
      badgeClass: isDark ? "bg-emerald-950/40 border-emerald-900/60 text-emerald-300" : "bg-emerald-50 border-emerald-100 text-emerald-700"
    };
  }
  if (rate >= 40) {
    return {
      emoji: "😐",
      title: "Steady Progress",
      desc: "Good balance. Don't let the chain break, you are doing well.",
      colorClass: "text-blue-500",
      badgeClass: isDark ? "bg-blue-950/40 border-blue-900/60 text-blue-300" : "bg-blue-50 border-blue-100 text-blue-700"
    };
  }
  if (rate >= 20) {
    return {
      emoji: "🥱",
      title: "Sluggish Inertia",
      desc: "A bit slow but you are showing up. Every small action counts!",
      colorClass: "text-indigo-500",
      badgeClass: isDark ? "bg-indigo-950/40 border-indigo-900/60 text-indigo-300" : "bg-indigo-50 border-indigo-100 text-indigo-700"
    };
  }
  return {
    emoji: "🥶",
    title: "Cold Dormancy",
    desc: "The routine ledger is inactive. Push to log your first tick!",
    colorClass: "text-slate-500",
    badgeClass: isDark ? "bg-slate-800/60 border-slate-700/60 text-slate-300" : "bg-slate-100 border-slate-200 text-slate-700"
  };
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

export const ProgressChart: React.FC<ProgressChartProps> = ({
  habits,
  currentMonth,
  currentYear,
  currentDay = 21,
  viewMode,
  onViewModeChange,
  isDark = false,
  selectedHabitId = "all",
  onSelectedHabitIdChange,
  onSelectDay,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const uniqueId = useId().replace(/:/g, "");
  const [dimensions, setDimensions] = useState(() => ({
    width: 500,
    height: typeof window !== "undefined" && window.innerWidth < 640 ? 195 : 230,
  }));

  // Calculate today's completed habits count
  const todayIdx = (currentDay || 21) - 1;
  const completedToday = habits.filter(h => h.days && h.days[todayIdx] === "completed").length;
  const totalHabits = habits.length;


  // Dynamic calculations based on habits
  const getDayCompletionRate = (dayIdx: number, habitId: string): number => {
    if (habits.length === 0) return 0;

    if (habitId === "all" || !habitId) {
      const completedCount = habits.filter(h => h.days && h.days[dayIdx] === "completed").length;
      return Math.round((completedCount / habits.length) * 100);
    } else {
      const habit = habits.find(h => h.id === habitId);
      if (!habit) return 0;
      return habit.days[dayIdx] === "completed" ? 100 : 0;
    }
  };

  // Generate chart data depending on viewMode (week = 7 days, month = 31 days)
  const daysLimit = viewMode === "week" ? 7 : 31;
  const weekDays = getDaysForWeek(currentDay, currentMonth, currentYear);
  const chartData = Array.from({ length: daysLimit }, (_, i) => {
    const dayNum = viewMode === "week" ? weekDays[i] : (i + 1);
    const dayIdx = dayNum - 1;
    const rate = getDayCompletionRate(dayIdx, "all");
    return { day: `${dayNum}`, rate };
  });

  // Calculate average rate for active days up to daysLimit
  let totalActiveRateSum = 0;
  for (let i = 0; i < daysLimit; i++) {
    const dayNum = viewMode === "week" ? weekDays[i] : (i + 1);
    const dayIdx = dayNum - 1;
    totalActiveRateSum += getDayCompletionRate(dayIdx, "all");
  }
  const currentMonthAverage = daysLimit > 0 ? totalActiveRateSum / daysLimit : 0;

  // Display rate and mood expression calculation
  const displayRate = hoveredIndex !== null && hoveredIndex < chartData.length ? chartData[hoveredIndex].rate : currentMonthAverage;
  const mood = getExpression(displayRate, isDark);

  // Handle resizing of the container dynamically to make the custom SVG perfectly fluid!
  useEffect(() => {
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width } = entry.contentRect;
        const isMobile = window.innerWidth < 640;
        setDimensions({
          width: Math.max(width, 260),
          height: isMobile ? 195 : 230,
        });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Calculate coordinates with generous breathing space so numbers never touch the graph
  const isMobileView = typeof window !== "undefined" && window.innerWidth < 640;
  const paddingLeft = isMobileView ? 44 : 50;
  const paddingRight = isMobileView ? 20 : 28;
  const paddingTop = isMobileView ? 16 : 22;
  const paddingBottom = isMobileView ? 34 : 38;
  const labelOffset = isMobileView ? 20 : 24;
  const chartWidth = Math.max(dimensions.width - paddingLeft - paddingRight, 100);
  const chartHeight = Math.max(dimensions.height - paddingTop - paddingBottom, 60);

  const points = chartData.map((d, index) => {
    const x = paddingLeft + (index / (chartData.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - (d.rate / 100) * chartHeight;
    return { x, y, label: d.day, val: d.rate };
  });

  // Generate Bezier path
  let pathD = "";
  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const cp1x = curr.x + chartWidth / (chartData.length - 1) / 3;
      const cp1y = curr.y;
      const cp2x = next.x - chartWidth / (chartData.length - 1) / 3;
      const cp2y = next.y;
      pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
    }
  }

  // Generate fill path
  const fillD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`
    : "";

  // Handle mouse move to display vertical ruler and update tooltips
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    let closestIndex = 0;
    let minDiff = Infinity;
    
    points.forEach((pt, idx) => {
      const diff = Math.abs(pt.x - mouseX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = idx;
      }
    });

    if (mouseX >= paddingLeft - 10 && mouseX <= paddingLeft + chartWidth + 10) {
      setHoveredIndex(closestIndex);
      setTooltipPos({
        x: points[closestIndex].x,
        y: points[closestIndex].y - 12,
      });
    } else {
      setHoveredIndex(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  return (
    <div 
      id="sabit-progress-chart-card"
      className={`rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border transition-all duration-300 flex flex-col h-auto sm:h-[380px] min-h-[260px] relative overflow-hidden ${
        isDark 
          ? "bg-[#1C1C1E] border-white/10 text-white shadow-sm" 
          : "bg-white border-slate-200/60 text-slate-900 shadow-xs"
      }`}
    >
      {/* Chart Header */}
      <div className="flex justify-between items-center mb-3 sm:mb-4 gap-2 shrink-0">
        {/* Header Title */}
        <div>
          <h4 className={`text-xs sm:text-sm font-bold tracking-tight flex items-center gap-2 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
            <span className={`p-1.5 rounded-full ${isDark ? "bg-[#007AFF]/20 text-[#007AFF]" : "bg-blue-50 text-[#007AFF]"}`}>
              <LucideIcon name="TrendingUp" size={14} />
            </span>
            <span>Gammy Analytics</span>
          </h4>
        </div>
        
        {/* Actions Row */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* iOS Segmented Control Track */}
          <div className={`flex p-1 rounded-full gap-1 border transition-all ${isDark ? "bg-white/10 border-white/5" : "bg-slate-100/90 border-slate-200/60"}`}>
            <button
              onClick={() => onViewModeChange("week")}
              className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all duration-200 cursor-pointer active:scale-95 ${
                viewMode === "week"
                  ? isDark ? "bg-[#007AFF] text-white shadow-sm" : "bg-white text-[#007AFF] shadow-xs"
                  : isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span className="sm:inline hidden">One </span>Week
            </button>
            <button
              onClick={() => onViewModeChange("month")}
              className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all duration-200 cursor-pointer active:scale-95 ${
                viewMode === "month"
                  ? isDark ? "bg-[#007AFF] text-white shadow-sm" : "bg-white text-[#007AFF] shadow-xs"
                  : isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Month
            </button>
          </div>
        </div>
      </div>


      {/* Chart Canvas Area */}
      <div ref={containerRef} className="flex-1 w-full min-h-0 relative select-none overflow-hidden max-w-full">
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="overflow-visible cursor-crosshair max-w-full block"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            <filter 
              id={`shadow-glow-${uniqueId}`} 
              x="-20%" 
              y="-20%" 
              width="140%" 
              height="140%"
            >
              <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#7C3AED" floodOpacity="0.22" />
            </filter>
            <linearGradient 
              id={`chart-fill-grad-${uniqueId}`} 
              x1="0" 
              y1="0" 
              x2="0" 
              y2="1"
            >
              <stop offset="0%" stopColor="#2563EB" stopOpacity={isDark ? "0.22" : "0.15"} />
              <stop offset="60%" stopColor="#7C3AED" stopOpacity={isDark ? "0.10" : "0.05"} />
              <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.00" />
            </linearGradient>
            <linearGradient 
              id={`chart-line-grad-${uniqueId}`} 
              x1="0" 
              y1="0" 
              x2="1" 
              y2="0"
            >
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="50%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
            <linearGradient 
              id={`grid-line-${uniqueId}`} 
              x1="0" 
              y1="0" 
              x2="1" 
              y2="0"
            >
              <stop offset="0%" stopColor={isDark ? "#334155" : "#E2E8F0"} stopOpacity="0.3" />
              <stop offset="50%" stopColor={isDark ? "#334155" : "#E2E8F0"} stopOpacity="0.8" />
              <stop offset="100%" stopColor={isDark ? "#334155" : "#E2E8F0"} stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* Grid lines (Y-axis thresholds) with clean offset */}
          {[0, 50, 100].map((level) => {
            const y = paddingTop + chartHeight - (level / 100) * chartHeight;
            return (
              <g key={level}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={paddingLeft + chartWidth}
                  y2={y}
                  stroke={`url(#grid-line-${uniqueId})`}
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingLeft - 10}
                  y={y + 3.5}
                  textAnchor="end"
                  fill={isDark ? "#94A3B8" : "#64748B"}
                  className="text-[10px] sm:text-[11px] font-bold font-sans"
                >
                  {level}%
                </text>
              </g>
            );
          })}

          {/* Closed Area Gradient Fill */}
          {fillD && <path d={fillD} fill={`url(#chart-fill-grad-${uniqueId})`} />}

          {/* Main Bezier Line Stroke with glow */}
          {pathD && (
            <>
              {/* Outer Glow Path */}
              <path
                d={pathD}
                fill="none"
                stroke={`url(#chart-line-grad-${uniqueId})`}
                strokeWidth={8}
                strokeLinecap="round"
                opacity={isDark ? 0.35 : 0.22}
                className="transition-all duration-300"
              />
              {/* Main Solid Foreground Path */}
              <path
                d={pathD}
                fill="none"
                stroke={`url(#chart-line-grad-${uniqueId})`}
                strokeWidth={3.5}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            </>
          )}

          {/* Interactive Scanning Guideline */}
          {hoveredIndex !== null && hoveredIndex < points.length && (
            <line
              x1={points[hoveredIndex].x}
              y1={paddingTop}
              x2={points[hoveredIndex].x}
              y2={paddingTop + chartHeight}
              stroke={isDark ? "#60A5FA" : "#3B82F6"}
              strokeWidth={1}
              strokeDasharray="3 3"
              className="transition-all duration-75"
            />
          )}

           {/* Highlighting Nodes */}
          {points.map((pt, idx) => {
            const isHovered = hoveredIndex === idx;
            const isImportantNode = viewMode === "week" 
              ? (idx === 0 || idx === 2 || idx === 4 || idx === 6)
              : (idx === 0 || idx === 4 || idx === 9 || idx === 14 || idx === 19 || idx === 24 || idx === 30);

            return (
              <g 
                key={idx} 
                className="cursor-pointer"
                onClick={() => {
                  const dayNum = parseInt(pt.label);
                  if (!isNaN(dayNum)) {
                    onSelectDay?.(dayNum);
                  }
                }}
              >
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={12}
                  fill="transparent"
                  className="peer"
                />
                {(isHovered || isImportantNode) && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 5.5 : 3.5}
                    fill={isHovered ? "#2563EB" : isDark ? "#1E293B" : "#FFFFFF"}
                    stroke="#2563EB"
                    strokeWidth={isHovered ? 2.5 : 2.0}
                    className="transition-all duration-200 shadow-sm"
                  />
                )}
                {/* Horizontal Labels */}
                <text
                  x={pt.x}
                  y={paddingTop + chartHeight + labelOffset}
                  textAnchor="middle"
                  fill={isHovered ? "#3B82F6" : isDark ? "#CBD5E1" : "#64748B"}
                  className={`text-[10px] sm:text-[11px] font-semibold transition-colors ${
                    isHovered ? "font-bold text-[#007AFF]" : ""
                  }`}
                >
                  {isHovered || isImportantNode ? pt.label : ""}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Custom Glassmorphic Tooltip */}
        {hoveredIndex !== null && hoveredIndex < chartData.length && (
          <div
            className={`absolute border rounded-xl p-2.5 shadow-xl text-left pointer-events-none transition-all duration-100 ease-out z-20 animate-fade-in ${
              isDark 
                ? "bg-slate-900 border-slate-700 text-slate-100 shadow-black/60" 
                : "bg-white/95 border-blue-100 text-slate-900 shadow-blue-900/10"
            }`}
            style={{
              left: `${Math.min(Math.max(tooltipPos.x - 65, 10), dimensions.width - 140)}px`,
              top: `${Math.max(tooltipPos.y - 70, 5)}px`,
              width: "135px",
            }}
          >
            <p className={`text-[8px] font-extrabold uppercase tracking-widest leading-none ${isDark ? "text-slate-300" : "text-slate-500"}`}>
              {viewMode === "week" ? `Week Day ${chartData[hoveredIndex].day}` : `${currentMonth} Day ${chartData[hoveredIndex].day}`}
            </p>
            <div className="flex items-baseline gap-1 mt-1 justify-between">
              <span className={`text-xs font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                {chartData[hoveredIndex].rate}%
              </span>
              <span className="text-[8px] font-extrabold text-blue-500 truncate max-w-[70px] uppercase">
                {habits.length} Habits
              </span>
            </div>
            <div className={`h-1 w-full rounded-full overflow-hidden mt-1 ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-300" 
                style={{ width: `${chartData[hoveredIndex].rate}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressChart;
