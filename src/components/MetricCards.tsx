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

const MOTIVATIONAL_SLIDES = [
  {
    url: "https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=1200&q=80",
    title: "Morning Momentum",
    quote: "Rise early. Build momentum every morning."
  },
  {
    url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80",
    title: "Peak Discipline",
    quote: "Consistency beats intensity every single day."
  },
  {
    url: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80",
    title: "Deep Focus",
    quote: "Small daily wins stack up into massive success."
  },
  {
    url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
    title: "Conquer Your Peak",
    quote: "Master your habits, master your destiny."
  },
  {
    url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    title: "Unstoppable Drive",
    quote: "Stay disciplined. Your future self will thank you."
  }
];

  const [isVideoHovered, setIsVideoHovered] = React.useState(false);
  const [tipIndex, setTipIndex] = React.useState(0);
  const [showTips, setShowTips] = React.useState(() => {
    return localStorage.getItem("sabit_show_tips") !== "false";
  });

  // Automatic Motivational Slideshow
  const [currentSlideIndex, setCurrentSlideIndex] = React.useState(0);
  const [isSlideshowPaused, setIsSlideshowPaused] = React.useState(false);

  // Custom Media upload states & settings
  const [customMedia, setCustomMedia] = React.useState<string | null>(() => {
    return localStorage.getItem("sabit_custom_media") || null;
  });
  const [customMediaType, setCustomMediaType] = React.useState<"video" | "image" | null>(() => {
    return (localStorage.getItem("sabit_custom_media_type") as "video" | "image" | null) || null;
  });
  const [customText, setCustomText] = React.useState<string>(() => {
    return localStorage.getItem("sabit_custom_media_text") || "";
  });
  const [isCustomizing, setIsCustomizing] = React.useState(false);
  const [mediaUrlInput, setMediaUrlInput] = React.useState("");
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Slideshow auto-rotation timer
  React.useEffect(() => {
    if (isSlideshowPaused || customMedia) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % MOTIVATIONAL_SLIDES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isSlideshowPaused, customMedia]);

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

    setIsCustomizing(false);
    window.dispatchEvent(
      new CustomEvent("sabit_trigger_toast", { 
        detail: isVideo ? "Video added successfully!" : "Image added successfully!" 
      })
    );
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

    window.dispatchEvent(
      new CustomEvent("sabit_trigger_toast", { 
        detail: isVideo ? "Video link applied successfully!" : "Image link applied successfully!" 
      })
    );
  };

  const handleResetMedia = () => {
    setCustomMedia(null);
    setCustomMediaType(null);
    setCustomText("");
    localStorage.removeItem("sabit_custom_media");
    localStorage.removeItem("sabit_custom_media_type");
    localStorage.removeItem("sabit_custom_media_text");
    setIsCustomizing(false);

    window.dispatchEvent(
      new CustomEvent("sabit_trigger_toast", { 
        detail: "Switched to automatic motivational slideshow!" 
      })
    );
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

  // iOS Grouped Card theme classes
  const cardBgClass = isDark
    ? "bg-[#1C1C1E] hover:bg-[#2C2C2E] border-white/10 shadow-sm text-white"
    : "bg-white hover:bg-slate-50/80 border-slate-200/60 shadow-xs text-slate-900";

  // Default slide image for Motivation Frame
  const DEFAULT_MOTIVATION_IMAGE = "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1200&q=80";

  return (
    <div 
      id="sabit-metrics-container"
      className="relative mb-6 transition-all duration-300"
    >
      <div 
        id="sabit-metrics-grid"
        className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 items-stretch"
      >
        {/* CARD 1: Success Analytic */}
        <div 
          className={`col-span-1 rounded-2xl p-2.5 sm:p-4 md:p-5 border transition-all duration-300 flex flex-col justify-between min-h-[75px] sm:min-h-[140px] md:h-[160px] group/card ${cardBgClass}`}
        >
          {/* Mobile view: Monthly Success Rate */}
          <div className="flex sm:hidden flex-col justify-between h-full py-0.5 min-w-0">
            <div className="flex items-center gap-1 min-w-0">
              <div className={`p-1 rounded-md shrink-0 ${isDark ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/50" : "bg-emerald-50 text-emerald-600 border border-emerald-100"}`}>
                <LucideIcon name="TrendingUp" size={11} strokeWidth={2.4} />
              </div>
              <span className={`text-[9px] font-black uppercase tracking-wider truncate ${isDark ? "text-white" : "text-slate-950"}`}>
                Success Analytic
              </span>
            </div>
            <div className="text-xl font-black tracking-tight text-emerald-600 dark:text-emerald-400 mt-1">
              {monthlySuccessRate}%
            </div>
            <span className="text-[9px] text-slate-700 dark:text-slate-200 font-bold truncate">Monthly Rate</span>
          </div>

          {/* Desktop view: Full breakdown focusing on full month */}
          <div className="hidden sm:flex flex-col justify-between h-full min-w-0">
            <div className="flex items-center justify-between gap-1 mb-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className={`p-1 rounded-md shrink-0 ${isDark ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/50" : "bg-emerald-50 text-emerald-600 border border-emerald-100"}`}>
                  <LucideIcon name="TrendingUp" size={12} strokeWidth={2.4} />
                </div>
                <span className={`text-[11px] font-black uppercase tracking-wider truncate ${isDark ? "text-white" : "text-slate-950"}`}>
                  Success Analytic
                </span>
              </div>
              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none shrink-0 ${
                isDark ? "text-emerald-300 bg-emerald-950/90 border border-emerald-700/60" : "text-emerald-800 bg-emerald-100 border border-emerald-300"
              }`}>
                Full Month
              </span>
            </div>

            <div className="flex items-center justify-between gap-1.5 my-1">
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <div className="flex items-baseline gap-1">
                  <h3 className={`text-2xl font-black tracking-tight leading-none ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                    {monthlySuccessRate}%
                  </h3>
                  <span className="text-[10px] text-slate-700 dark:text-slate-200 font-bold truncate">31-Day Rate</span>
                </div>

                <div className="flex items-center justify-between gap-1 text-[10px] font-bold text-slate-800 dark:text-slate-200">
                  <span>{totalMonthCompleted} / {totalMonthPossible} ticks</span>
                </div>
              </div>

              <div className="shrink-0 flex items-center justify-center pl-0.5">
                <CircularProgress percentage={monthlySuccessRate} color="#10B981" />
              </div>
            </div>

            <div className="flex items-center gap-1 text-[9px] text-slate-700 dark:text-slate-300 font-bold pt-1 border-t border-slate-500/20">
              <LucideIcon name="Calendar" size={10} className="text-emerald-500" strokeWidth={2.4} />
              <span>Full month completion index</span>
            </div>
          </div>
        </div>

        {/* CARD 2: Today's Achievement */}
        <div 
          className={`col-span-1 rounded-2xl p-2.5 sm:p-4 md:p-5 border transition-all duration-300 flex flex-col justify-between min-h-[75px] sm:min-h-[140px] md:h-[160px] group/card ${cardBgClass}`}
        >
          {/* Mobile view: Focus specifically on Today */}
          <div className="flex sm:hidden flex-col justify-between h-full py-0.5 min-w-0">
            <div className="flex items-center gap-1 min-w-0">
              <div className={`p-1 rounded-md shrink-0 ${isDark ? "bg-purple-950/80 text-purple-300 border border-purple-800/50" : "bg-purple-50 text-purple-600 border border-purple-100"}`}>
                <LucideIcon name="Award" size={11} strokeWidth={2.4} />
              </div>
              <span className={`text-[9px] font-black uppercase tracking-wider truncate ${isDark ? "text-white" : "text-slate-950"}`}>
                Achievement
              </span>
            </div>
            <div className="text-xl font-black tracking-tight text-purple-600 dark:text-purple-300 mt-1">
              {todaySuccessRate}%
            </div>
            <span className="text-[9px] text-slate-700 dark:text-slate-200 font-bold truncate">Today's Focus</span>
          </div>

          {/* Desktop view: Focused specifically on Today's achievements */}
          <div className="hidden sm:flex flex-col justify-between h-full min-w-0">
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1 min-w-0">
                  <div className={`p-1 rounded-md shrink-0 ${isDark ? "bg-purple-950/80 text-purple-300 border border-purple-800/50" : "bg-purple-50 text-purple-600 border border-purple-100"}`}>
                    <LucideIcon name="Award" size={12} strokeWidth={2.4} />
                  </div>
                  <span className={`text-[11px] font-black uppercase tracking-wider truncate ${isDark ? "text-white" : "text-slate-950"}`}>
                    Achievement
                  </span>
                </div>
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none shrink-0 ${
                  isDark ? "text-purple-300 bg-purple-950/90 border border-purple-700/60" : "text-purple-800 bg-purple-100 border border-purple-300"
                }`}>
                  Today
                </span>
              </div>

              <div className="flex items-baseline gap-1.5 mt-0.5">
                <h3 className={`text-2xl font-black tracking-tight leading-none ${isDark ? "text-purple-300" : "text-purple-700"}`}>
                  {todaySuccessRate}%
                </h3>
                <span className="text-[10px] text-slate-700 dark:text-slate-200 font-bold truncate">{todayCompleted} of {habits.length} Done</span>
              </div>
            </div>

            {/* Today's Achievement Progress Bar */}
            <div className="mt-1.5 pt-1.5 border-t border-slate-500/20 flex flex-col gap-1">
              <div className="flex items-center justify-between text-[9px] font-bold text-slate-800 dark:text-slate-200">
                <span>Today's Target</span>
                <span className="font-black text-purple-600 dark:text-purple-300">{todayCompleted}/{habits.length} Habits</span>
              </div>
              <div className="w-full bg-slate-300 dark:bg-slate-700 h-2 rounded-full overflow-hidden p-0.5">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, todaySuccessRate))}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: Automatic Motivational Slideshow & Custom Media Section */}
        <div 
          onMouseEnter={() => setIsSlideshowPaused(true)}
          onMouseLeave={() => setIsSlideshowPaused(false)}
          className={`col-span-2 sm:col-span-2 rounded-2xl border transition-all duration-300 min-h-[140px] sm:h-[160px] relative overflow-hidden group/media cursor-pointer ${
            isDark 
              ? "bg-slate-900 border-slate-800/90 shadow-md" 
              : "bg-white border-slate-200 shadow-md"
          }`}
        >
          {/* Settings / Customize button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsCustomizing(!isCustomizing);
            }}
            className="absolute top-2.5 right-3 bg-slate-950/70 hover:bg-slate-950/90 backdrop-blur-md p-1.5 rounded-xl border border-white/20 text-white z-20 transition-all active:scale-95 flex items-center justify-center cursor-pointer shadow-sm"
            title="Customize Media & Slideshow"
          >
            <LucideIcon name="Settings" size={13} />
          </button>

          {/* Media Frame */}
          <div className="absolute inset-0 w-full h-full overflow-hidden bg-slate-950">
            {customMedia ? (
              customMediaType === "video" ? (
                <video
                  src={customMedia}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <img 
                  src={customMedia} 
                  alt="Custom Background"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              )
            ) : (
              /* Automatic Motivational Slideshow */
              MOTIVATIONAL_SLIDES.map((slide, idx) => (
                <div
                  key={idx}
                  className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                    idx === currentSlideIndex ? "opacity-100 scale-100" : "opacity-0 pointer-events-none scale-105"
                  }`}
                >
                  <img 
                    src={slide.url} 
                    alt={slide.title}
                    className="w-full h-full object-cover brightness-[0.8] transition-transform duration-7000 ease-out transform scale-105 group-hover/media:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  {/* Subtle vignette gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                </div>
              ))
            )}

            {/* Content & Caption Overlay */}
            <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none z-10 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
              {/* Top Tag */}
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-indigo-600/70 text-white border border-indigo-400/30 backdrop-blur-md shadow-xs">
                  <LucideIcon name="Sparkles" size={11} className="text-indigo-200" />
                  <span>
                    {customMedia 
                      ? (customMediaType === "video" ? "Custom Video" : "Custom Photo") 
                      : MOTIVATIONAL_SLIDES[currentSlideIndex].title}
                  </span>
                </span>

                {/* Slideshow progress indicators if default */}
                {!customMedia && (
                  <div className="flex items-center gap-1 mr-8">
                    {MOTIVATIONAL_SLIDES.map((_, i) => (
                      <div 
                        key={i}
                        className={`h-1 rounded-full transition-all duration-500 ${
                          i === currentSlideIndex ? "w-4 bg-white" : "w-1 bg-white/40"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Headline & Action Arrow */}
              <div className="flex items-end justify-between gap-3">
                <div className="max-w-[80%]">
                  <h3 className="text-sm sm:text-base md:text-lg font-black text-white tracking-tight leading-tight drop-shadow-xs">
                    {customText || (!customMedia ? MOTIVATIONAL_SLIDES[currentSlideIndex].quote : "Personalized Motivation Frame")}
                  </h3>
                </div>

                {/* Right Arrow Action Circle */}
                <div className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white flex items-center justify-center shrink-0 transition-transform group-hover/media:scale-110 shadow-sm pointer-events-auto">
                  <LucideIcon name="ArrowRight" size={15} strokeWidth={2.5} />
                </div>
              </div>
            </div>
          </div>

          {/* Clean Customization Panel Overlay */}
          {isCustomizing && (
            <div 
              onClick={(e) => e.stopPropagation()} 
              className="absolute inset-0 bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md z-30 flex flex-col p-3.5 text-xs justify-between animate-fade-in text-white font-sans border border-blue-500/30 rounded-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-2 flex-shrink-0">
                <div className="flex items-center gap-1.5 text-blue-400 font-extrabold text-[11px] uppercase tracking-wider">
                  <LucideIcon name="Image" size={13} />
                  <span>Customize Media & Slideshow</span>
                </div>
                <button 
                  onClick={() => setIsCustomizing(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <LucideIcon name="X" size={14} />
                </button>
              </div>

              <div className="flex flex-col gap-2 my-1 min-w-0 overflow-y-auto custom-scrollbar flex-grow pr-1">
                {/* Custom Caption / Text Overlay input */}
                <div>
                  <label className="text-[9px] font-extrabold text-slate-300 uppercase tracking-wider block mb-1">Custom Caption (Optional)</label>
                  <input
                    type="text"
                    value={customText}
                    onChange={(e) => {
                      setCustomText(e.target.value);
                      localStorage.setItem("sabit_custom_media_text", e.target.value);
                    }}
                    placeholder="e.g. My Vision Board 2026"
                    className="w-full text-[10px] bg-slate-800/90 border border-white/15 rounded-xl px-2.5 py-1 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Upload Action buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 active:scale-98 transition-all py-1.5 px-2 rounded-xl font-bold text-[10px] text-white shadow-sm cursor-pointer"
                  >
                    <LucideIcon name="Upload" size={12} />
                    <span>Upload Image/Video</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetMedia}
                    className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 active:scale-98 transition-all py-1.5 px-2 rounded-xl font-bold text-[10px] text-slate-200 border border-white/10 cursor-pointer"
                  >
                    <LucideIcon name="Sparkles" size={12} className="text-amber-400" />
                    <span>Auto Slideshow</span>
                  </button>
                </div>

                {/* Direct Link Input */}
                <div>
                  <label className="text-[9px] font-extrabold text-slate-300 uppercase tracking-wider block mb-1">Paste Direct Media URL</label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={mediaUrlInput}
                      onChange={(e) => setMediaUrlInput(e.target.value)}
                      placeholder="https://images.unsplash.com/... or .mp4"
                      className="flex-1 text-[9px] bg-slate-800/90 border border-white/15 rounded-xl px-2.5 py-1 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleSaveUrl}
                      className="bg-blue-600 hover:bg-blue-500 px-3 rounded-xl font-bold text-[10px] flex items-center justify-center cursor-pointer shadow-xs"
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

              <div className="text-[9px] text-slate-400 text-center flex-shrink-0 pt-1 border-t border-white/10">
                ✨ Uploading automatically updates your frame and shows a confirmation toast!
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetricCards;
