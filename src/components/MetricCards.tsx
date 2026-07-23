import React from "react";
import LucideIcon from "./LucideIcon";
import { Habit } from "../types";

interface MetricCardsProps {
  successRate: number;
  monthlyAchievement: number;
  habitScore: number;
  currentStreak: number;
  longestStreak: number;
  activeHabitsCount: number;
  isDark?: boolean;
  habits: Habit[];
  currentDay?: number;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  successRate,
  monthlyAchievement,
  habitScore,
  currentStreak,
  longestStreak,
  activeHabitsCount,
  isDark = false,
  habits = [],
  currentDay = 20,
}) => {
  // Today's success rate is calculated dynamically based on the selected currentDay (index = currentDay - 1)
  const todayIndex = currentDay - 1;
  const todayCompleted = habits.filter(h => h.days[todayIndex] === "completed").length;
  const todaySuccessRate = habits.length > 0 
    ? Math.round((todayCompleted / habits.length) * 100) 
    : 0;

  // Monthly success rate across all 31 days
  let totalMonthCompleted = 0;
  let totalMonthPossible = habits.length * 31;
  habits.forEach(h => {
    h.days.forEach(day => {
      if (day === "completed") {
        totalMonthCompleted++;
      }
    });
  });
  const monthlySuccessRate = totalMonthPossible > 0 
    ? Math.round((totalMonthCompleted / totalMonthPossible) * 100) 
    : 0;

  const habitTips = [
    "The secret of your future is hidden in your daily routine.",
    "Consistency beats talent every single time. Keep showing up!",
    "Success doesn't come from what you do occasionally, it comes from what you do consistently.",
    "Discipline is choosing between what you want now and what you want most.",
    "First we make our habits, then our habits make us.",
    "Every day is a clean ledger. Write a masterclass today!",
    "Small daily improvements over time lead to stunning results.",
    "Your habits shape your identity, and your identity shapes your habits.",
    "Continuous improvement is better than delayed perfection.",
    "You do not rise to the level of your goals. You fall to the level of your systems."
  ];

  const [isVideoHovered, setIsVideoHovered] = React.useState(false);
  const [tipIndex, setTipIndex] = React.useState(0);
  const [showTips, setShowTips] = React.useState(() => {
    return localStorage.getItem("sabit_show_tips") !== "false";
  });

  // Custom Media upload states & settings
  const [customMedia, setCustomMedia] = React.useState<string | null>(() => {
    return localStorage.getItem("sabit_custom_media") || null;
  });
  const [customMediaType, setCustomMediaType] = React.useState<"video" | "image" | null>(() => {
    return (localStorage.getItem("sabit_custom_media_type") as "video" | "image" | null) || null;
  });
  const [customText, setCustomText] = React.useState<string>(() => {
    return localStorage.getItem("sabit_custom_media_text") || "AI Coach Habit Session (Autoplay on Hover)";
  });
  const [isCustomizing, setIsCustomizing] = React.useState(false);
  const [mediaUrlInput, setMediaUrlInput] = React.useState("");
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");
    
    if (!isVideo && !isImage) {
      alert("Please select an image or video file.");
      return;
    }

    const type = isVideo ? "video" : "image";
    const objectUrl = URL.createObjectURL(file);
    
    setCustomMedia(objectUrl);
    setCustomMediaType(type);
    localStorage.setItem("sabit_custom_media_type", type);
    
    if (isImage) {
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          const base64String = reader.result as string;
          localStorage.setItem("sabit_custom_media", base64String);
        } catch (err) {
          console.warn("Could not save image to localStorage due to size limits:", err);
        }
      };
      reader.readAsDataURL(file);
    } else {
      localStorage.removeItem("sabit_custom_media");
    }
  };

  const handleSaveUrl = () => {
    if (!mediaUrlInput.trim()) return;
    
    const url = mediaUrlInput.trim();
    const isVideo = /\.(mp4|webm|ogg|mov)($|\?)/i.test(url) || url.includes("video") || url.includes("mp4");
    const type = isVideo ? "video" : "image";

    setCustomMedia(url);
    setCustomMediaType(type);
    localStorage.setItem("sabit_custom_media", url);
    localStorage.setItem("sabit_custom_media_type", type);
    setMediaUrlInput("");
    setIsCustomizing(false);
  };

  const handleResetMedia = () => {
    setCustomMedia(null);
    setCustomMediaType(null);
    setCustomText("AI Coach Habit Session (Autoplay on Hover)");
    localStorage.removeItem("sabit_custom_media");
    localStorage.removeItem("sabit_custom_media_type");
    localStorage.removeItem("sabit_custom_media_text");
    setIsCustomizing(false);
  };

  React.useEffect(() => {
    const randomIdx = Math.floor(Math.random() * habitTips.length);
    setTipIndex(randomIdx);

    const handleShowTipsChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      setShowTips(customEvent.detail);
    };
    window.addEventListener("sabit_show_tips_changed", handleShowTipsChange);
    return () => {
      window.removeEventListener("sabit_show_tips_changed", handleShowTipsChange);
    };
  }, []);

  const handleNextTip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTipIndex((prev) => (prev + 1) % habitTips.length);
  };

  // Concentric circular progress showing both Month and Today rates
  const ConcentricProgress: React.FC<{ outerPct: number; innerPct: number; outerColor: string; innerColor: string }> = ({
    outerPct,
    innerPct,
    outerColor,
    innerColor,
  }) => {
    // Outer ring (Month)
    const outerRadius = 15;
    const outerCircumference = outerRadius * 2 * Math.PI;
    const outerStrokeDashoffset = outerCircumference - (Math.min(outerPct, 100) / 100) * outerCircumference;

    // Inner ring (Today)
    const innerRadius = 10;
    const innerCircumference = innerRadius * 2 * Math.PI;
    const innerStrokeDashoffset = innerCircumference - (Math.min(innerPct, 100) / 100) * innerCircumference;

    return (
      <div className="relative flex items-center justify-center select-none w-10 h-10 sm:w-12 sm:h-12 shrink-0">
        <svg className="transform -rotate-90 w-10 h-10 sm:w-12 sm:h-12" viewBox="0 0 36 36">
          {/* Outer Track */}
          <circle
            className={isDark ? "text-slate-800/40" : "text-slate-100"}
            strokeWidth={3}
            stroke="currentColor"
            fill="transparent"
            r={outerRadius}
            cx={18}
            cy={18}
          />
          {/* Outer Progress (Month) */}
          <circle
            strokeWidth={3}
            strokeDasharray={outerCircumference}
            strokeDashoffset={outerStrokeDashoffset}
            strokeLinecap="round"
            stroke={outerColor}
            fill="transparent"
            r={outerRadius}
            cx={18}
            cy={18}
            className="transition-all duration-500 ease-out"
          />
          {/* Inner Track */}
          <circle
            className={isDark ? "text-slate-800/40" : "text-slate-100"}
            strokeWidth={3}
            stroke="currentColor"
            fill="transparent"
            r={innerRadius}
            cx={18}
            cy={18}
          />
          {/* Inner Progress (Today) */}
          <circle
            strokeWidth={3}
            strokeDasharray={innerCircumference}
            strokeDashoffset={innerStrokeDashoffset}
            strokeLinecap="round"
            stroke={innerColor}
            fill="transparent"
            r={innerRadius}
            cx={18}
            cy={18}
            className="transition-all duration-500 ease-out"
          />
        </svg>
      </div>
    );
  };

  // Helper to color monthly calendar activity cells based on average daily completion rate
  const getCellColor = (dayIdx: number) => {
    const completed = habits.filter(h => h.days[dayIdx] === "completed").length;
    const activeHabits = habits.filter(h => h.days[dayIdx] !== "locked").length;
    
    if (activeHabits === 0) {
      return isDark ? "bg-slate-900/40 border-slate-800/50" : "bg-slate-50 border-slate-200/20";
    }
    
    const rate = completed / activeHabits;
    if (rate === 0) {
      return isDark ? "bg-slate-800/40 border-slate-700/30" : "bg-slate-100/60 border-slate-200/40";
    } else if (rate <= 0.35) {
      return isDark ? "bg-purple-950/40 border-purple-900/25 text-purple-400" : "bg-purple-50 border-purple-100 text-purple-600";
    } else if (rate <= 0.7) {
      return isDark ? "bg-purple-850/40 border-purple-700/25 text-purple-300" : "bg-purple-200/80 border-purple-300/60 text-purple-700";
    } else {
      return isDark ? "bg-purple-600/60 border-purple-500/30 text-white shadow-[0_0_8px_rgba(139,92,246,0.15)]" : "bg-purple-500 border-purple-600 text-white";
    }
  };

  // SVG circular progress component with responsive sizes
  const CircularProgress: React.FC<{ percentage: number; color: string }> = ({
    percentage,
    color,
  }) => {
    const radius = 15;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative flex items-center justify-center select-none w-8 h-8 sm:w-10 sm:h-10 shrink-0">
        <svg className="transform -rotate-90 w-8 h-8 sm:w-10 sm:h-10" viewBox="0 0 36 36">
          <circle
            className={isDark ? "text-slate-800/60" : "text-slate-100"}
            strokeWidth={3.5}
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={18}
            cy={18}
          />
          <circle
            strokeWidth={3.5}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke={color}
            fill="transparent"
            r={radius}
            cx={18}
            cy={18}
            className="transition-all duration-500 ease-out"
          />
        </svg>
      </div>
    );
  };

  // Glassmorphic Card theme classes
  const cardBgClass = isDark
    ? "bg-slate-900 hover:bg-slate-850 border-slate-800/90 shadow-[0_4px_20px_rgba(0,0,0,0.35)] text-white"
    : "bg-white hover:bg-slate-50 border-slate-200/80 shadow-md text-slate-900";

  return (
    <div 
      id="sabit-metrics-container"
      className="relative mb-6 transition-all duration-300"
    >
      <div 
        id="sabit-metrics-grid"
        className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 items-center"
      >
        {/* CARD 1: Success Analytic */}
        <div 
          className={`col-span-1 md:col-span-1 rounded-2xl p-3 md:p-5 border hover:-translate-y-0.5 transition-all duration-300 flex flex-row md:flex-col justify-between items-center md:items-stretch h-[95px] md:h-[160px] group/card ${cardBgClass}`}
        >
          <div className="flex flex-col justify-center min-w-0">
            <span className={`text-[9.5px] sm:text-[10px] md:text-[11px] font-extrabold uppercase tracking-wider leading-tight ${isDark ? "text-slate-200" : "text-slate-800"}`}>
              <span className="block sm:inline">Success </span>
              <span className="block sm:inline">Analytic</span>
            </span>
            <div className="flex flex-col gap-0.5 mt-1 md:mt-1.5">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 self-center" />
                <span className={`text-[8.5px] md:text-[10px] font-bold ${isDark ? "text-slate-300" : "text-slate-500"}`}>Today:</span>
                <span className={`text-[11px] md:text-sm font-black tracking-tight leading-none text-emerald-400`}>
                  {todaySuccessRate}%
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 self-center" />
                <span className={`text-[8.5px] md:text-[10px] font-bold ${isDark ? "text-slate-300" : "text-slate-500"}`}>Month:</span>
                <span className={`text-[11px] md:text-sm font-black tracking-tight leading-none text-blue-400`}>
                  {monthlySuccessRate}%
                </span>
              </div>
            </div>
          </div>
          <div className="shrink-0 flex items-center justify-center md:mt-2">
            <ConcentricProgress 
              outerPct={monthlySuccessRate} 
              innerPct={todaySuccessRate} 
              outerColor="var(--sabit-primary)" 
              innerColor="#10B981" 
            />
          </div>
        </div>

        {/* CARD 2: Monthly Achievement */}
        <div 
          className={`col-span-1 md:col-span-1 rounded-2xl p-3 md:p-5 border hover:-translate-y-0.5 transition-all duration-300 flex flex-row md:flex-col justify-between items-center md:items-stretch h-[95px] md:h-[160px] group/card ${cardBgClass}`}
        >
          <div className="flex flex-col justify-center min-w-0">
            <span className={`text-[9.5px] sm:text-[10px] md:text-[11px] font-extrabold uppercase tracking-wider leading-tight ${isDark ? "text-slate-200" : "text-slate-800"}`}>
              <span className="block sm:inline">Monthly </span>
              <span className="block sm:inline">Achievement</span>
            </span>
            <div className="flex items-center gap-1.5 mt-1 md:mt-1.5">
              <h3 className={`text-xs sm:text-sm md:text-xl font-black tracking-tight leading-none ${isDark ? "text-purple-300" : "text-purple-700"}`}>
                {monthlyAchievement}%
              </h3>
              <span className={`text-[7.5px] md:text-[8.5px] font-extrabold px-1.5 py-0.5 rounded leading-none shrink-0 ${
                isDark ? "text-indigo-300 bg-indigo-950/80 border border-indigo-800/50" : "text-indigo-600 bg-indigo-50"
              }`}>
                {activeHabitsCount} Active
              </span>
            </div>
            <span className="hidden md:block text-[8px] text-slate-400 mt-1.5 font-medium">31-Day Activity Heatmap</span>
          </div>
          
          {/* Mini 31-day contribution heat map grid */}
          <div className="shrink-0 flex items-center justify-center md:mt-2">
            <div className="grid grid-cols-7 gap-[1.5px] select-none p-1 rounded-md bg-slate-500/5 border border-slate-500/10">
              {Array.from({ length: 31 }, (_, idx) => {
                const cellColor = getCellColor(idx);
                // Calculate completion rate of this day for tooltip
                const dayCompleted = habits.filter(h => h.days[idx] === "completed").length;
                const pct = habits.length > 0 ? Math.round((dayCompleted / habits.length) * 100) : 0;
                return (
                  <div
                    key={idx}
                    className={`w-[6px] h-[6px] sm:w-[7px] sm:h-[7px] md:w-2 md:h-2 rounded-[1.5px] border ${cellColor} transition-all duration-300 shrink-0 aspect-square`}
                    title={`Day ${idx + 1}: ${pct}% completed`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* CARD 3: AI Coach Autoplay Video Session / Custom Media - Hidden on mobile view */}
        <div 
          onMouseEnter={() => setIsVideoHovered(true)}
          onMouseLeave={() => setIsVideoHovered(false)}
          onClick={() => {
            if (!customMedia) {
              setIsVideoHovered(!isVideoHovered);
            }
          }}
          className={`hidden sm:block sm:col-span-2 rounded-2xl border transition-all duration-300 h-[145px] sm:h-[160px] relative overflow-hidden group/video cursor-pointer ${
            isDark 
              ? "bg-slate-900 border-slate-800/90 shadow-md" 
              : "bg-white border-slate-200 shadow-md"
          } p-0`}
        >
          {/* Settings / Customize button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsCustomizing(!isCustomizing);
            }}
            className="absolute top-2.5 right-3 bg-slate-950/70 hover:bg-slate-950/90 backdrop-blur-sm p-1.5 rounded-lg border border-white/10 text-white z-20 transition-all active:scale-95 flex items-center justify-center cursor-pointer"
            title="Customize Card Media & Text"
          >
            <LucideIcon name="Settings" size={12} />
          </button>

          {/* Video Frame with Custom Refs - Full Card Cover */}
          <div className="absolute inset-0 w-full h-full overflow-hidden bg-slate-950 flex items-center justify-center group z-10">
            {customMedia ? (
              customMediaType === "video" ? (
                <video
                  src={customMedia}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <img 
                  src={customMedia} 
                  alt="Custom Background"
                  className="absolute inset-0 w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              )
            ) : isVideoHovered ? (
              <iframe
                src="https://www.youtube.com/embed/PZ7lDrwYdZc?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&modestbranding=1"
                className="absolute inset-0 w-full h-full pointer-events-none scale-105"
                title="YouTube AI Habit Session"
                frameBorder="0"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            ) : (
              <img 
                src="https://img.youtube.com/vi/PZ7lDrwYdZc/mqdefault.jpg" 
                alt="AI Habit Session Thumbnail"
                className="w-full h-full object-cover opacity-85 group-hover/video:opacity-100 transition-all duration-300 transform scale-110 group-hover/video:scale-105"
                referrerPolicy="no-referrer"
              />
            )}

            {/* Action/Text Overlay */}
            <div className="absolute inset-0 bg-slate-950/20 group-hover/video:bg-transparent flex items-center justify-center transition-all pointer-events-none">
              {!customMedia && !isVideoHovered && (
                <div className="w-10 h-10 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center border border-white/35 group-hover/video:scale-110 transition-transform">
                  <LucideIcon name="Play" size={14} className="text-white fill-white ml-0.5" />
                </div>
              )}
              <div className="absolute bottom-2.5 left-3 bg-slate-950/60 backdrop-blur-sm py-1 px-2.5 rounded-lg border border-white/10 flex items-center gap-1.5 text-[8.5px] sm:text-[9.5px] font-bold text-white tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{customText}</span>
              </div>
            </div>
          </div>

          {/* Customization Control Overlay Panel */}
          {isCustomizing && (
            <div 
              onClick={(e) => e.stopPropagation()} 
              className="absolute inset-0 bg-slate-900/95 dark:bg-slate-950/98 z-30 flex flex-col p-3 text-xs justify-between animate-fade-in text-white font-sans"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-1 flex-shrink-0">
                <span className="font-extrabold text-[10px] uppercase tracking-wider text-blue-400">Customize Media & Text</span>
                <button 
                  onClick={() => setIsCustomizing(false)}
                  className="text-slate-400 hover:text-white p-0.5 rounded-md cursor-pointer"
                >
                  <LucideIcon name="X" size={12} />
                </button>
              </div>

              <div className="flex flex-col gap-1.5 my-1.5 min-w-0 overflow-y-auto custom-scrollbar flex-grow pr-1">
                {/* Text Overlay input */}
                <div>
                  <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wide block mb-0.5">Text Overlay</label>
                  <input
                    type="text"
                    value={customText}
                    onChange={(e) => {
                      setCustomText(e.target.value);
                      localStorage.setItem("sabit_custom_media_text", e.target.value);
                    }}
                    placeholder="Enter custom card overlay text"
                    className="w-full text-[9px] bg-slate-800 border border-white/10 rounded-lg px-2 py-0.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Media options */}
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-500 active:scale-98 transition-all py-1 rounded-lg font-bold text-[9px] cursor-pointer"
                  >
                    <LucideIcon name="Upload" size={10} />
                    <span>Upload File</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetMedia}
                    className="flex items-center justify-center gap-1 bg-slate-800 hover:bg-slate-700 active:scale-98 transition-all py-1 rounded-lg font-bold text-[9px] border border-white/5 cursor-pointer"
                  >
                    <LucideIcon name="RotateCcw" size={10} />
                    <span>Reset Default</span>
                  </button>
                </div>

                {/* Direct Link Input */}
                <div>
                  <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wide block mb-0.5">Or Paste Direct Link (Video/Image)</label>
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={mediaUrlInput}
                      onChange={(e) => setMediaUrlInput(e.target.value)}
                      placeholder="https://example.com/video.mp4"
                      className="flex-1 text-[8px] bg-slate-800 border border-white/10 rounded-lg px-2 py-0.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleSaveUrl}
                      className="bg-blue-600 hover:bg-blue-500 px-2 rounded-lg font-bold text-[8px] flex items-center justify-center cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                accept="video/*,image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="text-[8px] text-slate-400 text-center flex-shrink-0">
                Supports local MP4, WebM, PNG, JPG files or external links.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetricCards;
