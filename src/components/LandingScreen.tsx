import React, { useState } from "react";
import { LucideIcon } from "./LucideIcon";
import { GammyLogo } from "./GammyLogo";

interface LandingScreenProps {
  onOpenAuth: (mode: "login" | "signup") => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({
  onOpenAuth,
  isDark,
  setIsDark,
}) => {
  // Interactive mini preview for prospective users
  const [demoHabits, setDemoHabits] = useState([
    { id: "1", name: "Deep Focus (90 min)", icon: "Code", color: "#2563EB", streak: 19, days: [true, true, true, true, true, false, true] },
    { id: "2", name: "Morning Meditation", icon: "Brain", color: "#8B5CF6", streak: 14, days: [true, true, true, false, true, true, true] },
    { id: "3", name: "Hydrate (3L Daily)", icon: "Droplets", color: "#06B6D4", streak: 26, days: [true, true, true, true, true, true, true] },
    { id: "4", name: "Strength Training", icon: "Flame", color: "#F97316", streak: 11, days: [true, false, true, true, false, true, true] },
  ]);

  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const toggleDemoDay = (habitIndex: number, dayIndex: number) => {
    setDemoHabits((prev) => {
      const next = [...prev];
      const habit = { ...next[habitIndex] };
      const days = [...habit.days];
      days[dayIndex] = !days[dayIndex];
      habit.days = days;
      habit.streak = days.filter(Boolean).length >= 5 ? habit.streak + 1 : Math.max(0, habit.streak - 1);
      next[habitIndex] = habit;
      return next;
    });
  };

  const daysOfWeek = ["M", "T", "W", "T", "F", "S", "S"];

  const benefits = [
    {
      icon: "Zap",
      title: "Lightning fast matrix",
      desc: "Tick your habits in under 2 seconds. High-density visual ledger engineered for zero friction.",
      accent: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-600 text-white"
    },
    {
      icon: "RefreshCw",
      title: "Real-time cloud sync",
      desc: "Every check-in instantly persists across desktop, mobile, and tablet with individual account isolation.",
      accent: "text-indigo-600 dark:text-indigo-400",
      iconBg: "bg-indigo-600 text-white"
    },
    {
      icon: "Bot",
      title: "24/7 AI Strategist",
      desc: "Instant behavioral coaching, habit stacking blueprints, and recovery protocols powered by Gemini AI.",
      accent: "text-purple-600 dark:text-purple-400",
      iconBg: "bg-purple-600 text-white"
    },
    {
      icon: "TrendingUp",
      title: "Gammy Analytics",
      desc: "Live completion graphs, streak velocity trackers, and weekly performance breakdowns.",
      accent: "text-cyan-600 dark:text-cyan-400",
      iconBg: "bg-cyan-600 text-white"
    },
    {
      icon: "PauseCircle",
      title: "Flexible & pauseable",
      desc: "Take vacations or rest days without breaking your hard-earned streak identity.",
      accent: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-600 text-white"
    },
    {
      icon: "Sparkles",
      title: "Clean iOS & Web Experience",
      desc: "Distraction-free interface with dark & light theme modes, haptic feedback, and responsive layout.",
      accent: "text-rose-600 dark:text-rose-400",
      iconBg: "bg-rose-600 text-white"
    },
  ];

  const comparisonRows = [
    { feature: "Instant 31-day visual matrix", flow: true, others: false },
    { feature: "Account-isolated real-time cloud sync", flow: true, others: false },
    { feature: "24/7 Behavioral AI Coach", flow: true, others: false },
    { feature: "Zero clutter, clean iOS/Mac UI", flow: true, others: false },
    { feature: "Interactive Gammy analytics", flow: true, others: false },
    { feature: "100% Free core tracker, no ads", flow: true, others: false },
  ];

  const faqs = [
    {
      q: "How does habit isolation work across different email accounts?",
      a: "Each email account has its own secure, isolated database partition in the cloud. Habits added under your email ID are only visible and accessible when logged in with that specific account."
    },
    {
      q: "How does real-time sync keep desktop and mobile in sync?",
      a: "When you log in on desktop and mobile with the same email, your habits and check-in logs synchronize instantly through Firestore. Any checkmark on one device updates on the other in real time."
    },
    {
      q: "Can I pause habits during vacations or sick days?",
      a: "Yes! You can mark days as skipped or pause habits without losing your cumulative streak momentum or altering your ledger history."
    },
    {
      q: "How does the built-in AI Coach assist my daily routine?",
      a: "The Gemini AI Coach analyzes your completion patterns, suggests actionable habit stacking rules, and gives personalized advice whenever motivation dips."
    },
    {
      q: "Is Gammy mobile friendly?",
      a: "Yes. Gammy is designed with a responsive iOS-inspired design, custom fluid charts, and touch-optimized matrix controls for iPhone, Android, and tablets."
    }
  ];

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 relative overflow-x-hidden ${
      isDark ? "dark bg-[#070A11] text-slate-100 selection:bg-blue-600 selection:text-white" : "bg-[#F8FAFC] text-slate-900 selection:bg-blue-100 selection:text-blue-900"
    }`}>

      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-blue-600/20 via-indigo-600/15 to-transparent blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-96 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-purple-600/15 via-pink-600/10 to-transparent blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-[1600px] left-0 w-[550px] h-[550px] bg-gradient-to-tr from-cyan-600/15 via-blue-600/10 to-transparent blur-[140px] rounded-full pointer-events-none" />

      {/* 1. TOP BAR */}
      <header className={`w-full border-b backdrop-blur-xl sticky top-0 z-50 transition-colors ${
        isDark ? "bg-[#070A11]/90 border-slate-800" : "bg-white/90 border-slate-200 shadow-xs"
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <GammyLogo size={32} />
            </div>
            <span className={`text-xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-950"}`}>
              Gammy
            </span>
          </div>

          {/* Clean Navigation Links with Guaranteed High Contrast */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-black uppercase tracking-wider">
            <a href="#benefits" className={`transition-colors font-black ${isDark ? "text-slate-200 hover:text-blue-400" : "text-slate-900 hover:text-blue-600"}`}>Benefits</a>
            <a href="#demo" className={`transition-colors font-black ${isDark ? "text-slate-200 hover:text-blue-400" : "text-slate-900 hover:text-blue-600"}`}>Demo</a>
            <a href="#how-it-works" className={`transition-colors font-black ${isDark ? "text-slate-200 hover:text-blue-400" : "text-slate-900 hover:text-blue-600"}`}>How it works</a>
            <a href="#comparison" className={`transition-colors font-black ${isDark ? "text-slate-200 hover:text-blue-400" : "text-slate-900 hover:text-blue-600"}`}>Comparison</a>
            <a href="#faq" className={`transition-colors font-black ${isDark ? "text-slate-200 hover:text-blue-400" : "text-slate-900 hover:text-blue-600"}`}>FAQ</a>
          </nav>

          {/* Action Zone */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <button
              onClick={() => setIsDark(!isDark)}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                isDark 
                  ? "bg-slate-900 border-slate-700 text-amber-400 hover:bg-slate-800" 
                  : "bg-white border-slate-300 text-slate-800 hover:bg-slate-50 shadow-xs"
              }`}
              title="Toggle theme"
              aria-label="Toggle theme"
            >
              <LucideIcon name={isDark ? "Sun" : "Moon"} size={16} strokeWidth={2.4} />
            </button>

            <button
              onClick={() => onOpenAuth("login")}
              className={`text-xs font-bold px-4 py-2.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
                isDark
                  ? "border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800"
                  : "border-slate-300 bg-white text-slate-900 hover:bg-slate-50 shadow-xs"
              }`}
            >
              Sign In
            </button>

            <button
              onClick={() => onOpenAuth("signup")}
              className="text-xs font-bold px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white shadow-md shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer whitespace-nowrap"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-10 sm:pt-20 pb-16 sm:pb-20 max-w-5xl mx-auto px-4 sm:px-6 text-center z-10">
        
        {/* Rating Card - Ultra Clean & Sharp */}
        <div className={`mx-auto mb-10 w-full max-w-sm sm:max-w-md rounded-2xl sm:rounded-3xl border p-3.5 sm:p-4 transition-all duration-300 ring-1 ${
          isDark 
            ? "bg-[#111622] border-slate-700 shadow-xl shadow-black/60 ring-white/10" 
            : "bg-white border-slate-300 shadow-xl shadow-slate-300/40 ring-slate-900/10"
        }`}>
          <div className={`grid grid-cols-3 items-center divide-x ${isDark ? "divide-slate-700" : "divide-slate-200"} text-center`}>
            
            {/* 1. Golden Stars */}
            <div className="flex items-center justify-center gap-1 text-amber-500 text-sm sm:text-base font-black px-1">
              <span>★</span>
              <span>★</span>
              <span>★</span>
              <span>★</span>
              <span>★</span>
            </div>

            {/* 2. Rated 4.9 / 5 */}
            <div className="flex items-center justify-center gap-1.5 px-2 whitespace-nowrap">
              <span className={`font-bold text-xs sm:text-sm ${isDark ? "text-white" : "text-slate-950"}`}>Rated</span>
              <span className="text-blue-600 dark:text-blue-400 font-black text-xs sm:text-sm tracking-tight">4.9 / 5</span>
            </div>

            {/* 3. 2,000+ users */}
            <div className="flex items-center justify-center gap-2.5 px-2">
              <div className="text-purple-600 dark:text-purple-400 shrink-0">
                <LucideIcon name="Users" size={20} strokeWidth={2.4} />
              </div>
              <div className="text-left leading-tight">
                <p className={`text-xs sm:text-sm font-black ${isDark ? "text-white" : "text-slate-950"}`}>2,000+</p>
                <p className={`text-[11px] font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>users</p>
              </div>
            </div>

          </div>
        </div>

        {/* Big Bold Headline */}
        <h1 className={`text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.08] max-w-3xl mx-auto ${
          isDark ? "text-white" : "text-slate-950"
        }`}>
          A habit tracker <br />
          <span className="text-blue-600 dark:text-blue-400 italic font-serif font-normal">
            with a twist.
          </span>
        </h1>

        {/* Subtitle with High Contrast */}
        <p className={`mt-6 sm:mt-8 text-base sm:text-xl max-w-xl mx-auto leading-relaxed font-semibold ${
          isDark ? "text-slate-200" : "text-slate-800"
        }`}>
          Habit systems to scale your daily consistency and focus. Replace clunky apps and unreliable willpower with one high-performance routine ledger.
        </p>

        {/* High-Impact Gradient CTA Buttons */}
        <div className="mt-8 sm:mt-10 flex flex-col items-center gap-3.5 justify-center max-w-sm sm:max-w-md mx-auto w-full">
          <button
            onClick={() => onOpenAuth("signup")}
            className="w-full py-4 px-8 rounded-full text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 shadow-xl shadow-blue-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Start tracking today</span>
            <LucideIcon name="ArrowRight" size={16} strokeWidth={2.4} />
          </button>

          <a
            href="#demo"
            className={`w-full py-3.5 px-8 rounded-full border text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              isDark
                ? "bg-slate-900 border-slate-700 text-slate-100 hover:bg-slate-800"
                : "bg-white border-slate-300 text-slate-900 hover:bg-slate-50 shadow-xs"
            }`}
          >
            <div className="w-5 h-5 rounded-full border border-slate-400 dark:border-slate-500 flex items-center justify-center">
              <LucideIcon name="Play" size={10} className="ml-0.5 text-slate-800 dark:text-slate-200 fill-current" />
            </div>
            <span>Try Interactive Demo</span>
          </a>
        </div>

        {/* Trust Badges Row with Guaranteed Visibility */}
        <div className={`mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-black ${
          isDark ? "text-slate-200" : "text-slate-900"
        }`}>
          <div className="flex items-center gap-2">
            <LucideIcon name="CheckCircle" size={16} className={isDark ? "text-blue-400" : "text-blue-600"} strokeWidth={2.4} />
            <span className={isDark ? "text-slate-200" : "text-slate-900"}>Real-time account sync</span>
          </div>

          <div className={`hidden sm:block h-3.5 w-[1px] ${isDark ? "bg-slate-700" : "bg-slate-300"}`} />

          <div className="flex items-center gap-2">
            <LucideIcon name="CheckCircle" size={16} className={isDark ? "text-blue-400" : "text-blue-600"} strokeWidth={2.4} />
            <span className={isDark ? "text-slate-200" : "text-slate-900"}>Individual data isolation</span>
          </div>

          <div className={`hidden sm:block h-3.5 w-[1px] ${isDark ? "bg-slate-700" : "bg-slate-300"}`} />

          <div className="flex items-center gap-2">
            <LucideIcon name="CheckCircle" size={16} className={isDark ? "text-blue-400" : "text-blue-600"} strokeWidth={2.4} />
            <span className={isDark ? "text-slate-200" : "text-slate-900"}>100% Free core tracking</span>
          </div>
        </div>

        {/* Key Metrics Strip with Crisp Icons & Sharp Typography */}
        <div className={`grid grid-cols-3 divide-x mt-12 pt-8 border-t max-w-xl mx-auto text-center ${
          isDark ? "divide-slate-800 border-slate-800" : "divide-slate-300 border-slate-300"
        }`}>
          {/* Card 1: 100% */}
          <div className="px-2 sm:px-4 flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-3 shadow-md shadow-blue-500/25">
              <LucideIcon name="Shield" size={22} strokeWidth={2.4} />
            </div>
            <p className={`text-2xl sm:text-3xl font-black ${isDark ? "text-blue-400" : "text-blue-600"}`}>100%</p>
            <p className={`text-xs font-black mt-1.5 leading-snug ${isDark ? "text-slate-200" : "text-slate-900"}`}>
              Per-User Data<br />Isolation
            </p>
          </div>

          {/* Card 2: 31-Day */}
          <div className="px-2 sm:px-4 flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center mb-3 shadow-md shadow-purple-500/25">
              <LucideIcon name="BarChart" size={22} strokeWidth={2.4} />
            </div>
            <p className={`text-2xl sm:text-3xl font-black ${isDark ? "text-purple-400" : "text-purple-600"}`}>31-Day</p>
            <p className={`text-xs font-black mt-1.5 leading-snug ${isDark ? "text-slate-200" : "text-slate-900"}`}>
              High-Density<br />Matrix
            </p>
          </div>

          {/* Card 3: 24/7 */}
          <div className="px-2 sm:px-4 flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-3 shadow-md shadow-emerald-500/25">
              <LucideIcon name="Zap" size={22} strokeWidth={2.4} />
            </div>
            <p className={`text-2xl sm:text-3xl font-black ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>24/7</p>
            <p className={`text-xs font-black mt-1.5 leading-snug ${isDark ? "text-slate-200" : "text-slate-900"}`}>
              Gemini AI<br />Coaching
            </p>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE DEMO SHOWCASE WITH EXACT CIRCULAR TICK ICONS */}
      <section id="demo" className={`py-16 sm:py-24 max-w-5xl mx-auto px-4 sm:px-6 w-full relative z-10 border-t ${
        isDark ? "border-slate-800" : "border-slate-200"
      }`}>
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-200 mb-3 border border-blue-300 dark:border-blue-700 shadow-xs">
            ✨ Interactive Experience
          </div>
          <h2 className={`text-3xl sm:text-5xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-950"}`}>
            Test the live matrix right now.
          </h2>
          <p className={`mt-3 text-base sm:text-lg max-w-xl mx-auto font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
            Click any day circle below to complete habits with the exact circular tick icon from the dashboard.
          </p>
        </div>

        <div className="relative">
          {/* Subtle Outer Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/30 via-indigo-600/20 to-purple-600/30 rounded-3xl blur-xl opacity-60 pointer-events-none" />

          <div className={`relative p-6 sm:p-8 rounded-3xl border transition-all backdrop-blur-xl ${
            isDark 
              ? "bg-[#0C101A] border-slate-800 shadow-2xl shadow-black/80" 
              : "bg-white border-slate-200 shadow-xl shadow-slate-200/60"
          }`}>
            {/* Header */}
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b gap-3 ${
              isDark ? "border-slate-800" : "border-slate-200"
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                  <LucideIcon name="Target" size={20} strokeWidth={2.4} />
                </div>
                <div>
                  <h3 className={`text-sm font-black flex items-center gap-2 ${isDark ? "text-white" : "text-slate-950"}`}>
                    <span>Gammy Weekly Matrix</span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">Live Demo</span>
                  </h3>
                  <p className={`text-xs font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>Click any circle to toggle checkmark and streak</p>
                </div>
              </div>

              <button
                onClick={() => onOpenAuth("login")}
                className={`text-xs font-extrabold flex items-center gap-1.5 cursor-pointer self-start sm:self-auto hover:underline ${
                  isDark ? "text-blue-400" : "text-blue-600"
                }`}
              >
                <span>Log in to save your personal habits</span>
                <LucideIcon name="ArrowRight" size={13} strokeWidth={2.4} />
              </button>
            </div>

            {/* Table Preview */}
            <div className="mt-6 space-y-3">
              {/* Desktop Header */}
              <div className={`hidden sm:grid grid-cols-12 gap-2 text-xs font-black px-3 pb-2 border-b ${
                isDark ? "border-slate-800 text-white" : "border-slate-200 text-slate-950"
              }`}>
                <div className="col-span-5 sm:col-span-4 font-black">Habit & Target</div>
                <div className="col-span-5 sm:col-span-6 flex justify-between px-2 font-black">
                  {daysOfWeek.map((d, i) => (
                    <span key={i} className="w-8 text-center font-black">{d}</span>
                  ))}
                </div>
                <div className="col-span-2 text-right font-black">Streak</div>
              </div>

              {demoHabits.map((habit, hIdx) => (
                <div 
                  key={habit.id}
                  className={`p-3.5 sm:p-3 rounded-2xl border transition-all ${
                    isDark 
                      ? "bg-slate-900/90 border-slate-800 hover:border-slate-700" 
                      : "bg-slate-50 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {/* MOBILE VIEW */}
                  <div className="sm:hidden space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div 
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                          style={{ backgroundColor: habit.color }}
                        >
                          <LucideIcon name={habit.icon} size={15} strokeWidth={2.4} />
                        </div>
                        <span className={`text-xs font-black truncate ${isDark ? "text-white" : "text-slate-950"}`}>{habit.name}</span>
                      </div>

                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-500/15 text-orange-600 dark:text-orange-400 font-black text-xs border border-orange-500/30 shrink-0">
                        <LucideIcon name="Flame" size={13} strokeWidth={2.4} />
                        <span>{habit.streak}d</span>
                      </span>
                    </div>

                    {/* Touch-Friendly Row with Exact Circular Ticks */}
                    <div className={`flex items-center justify-between gap-1 pt-2 border-t ${
                      isDark ? "border-slate-800" : "border-slate-200"
                    }`}>
                      {habit.days.map((isDone, dIdx) => (
                        <div key={dIdx} className="flex-1 flex flex-col items-center gap-1.5">
                          <span className={`text-[11px] font-black ${isDark ? "text-slate-200" : "text-slate-900"}`}>{daysOfWeek[dIdx]}</span>
                          <button
                            onClick={() => toggleDemoDay(hIdx, dIdx)}
                            className="p-0.5 rounded-full cursor-pointer focus:outline-none transition-transform active:scale-90"
                            title={`Toggle ${daysOfWeek[dIdx]}`}
                          >
                            {/* Circular Tick Icon matching main dashboard */}
                            <div
                              className={`h-7 w-7 rounded-full flex items-center justify-center transition-all duration-200 border ${
                                isDone
                                  ? "text-white border-transparent shadow-xs scale-105"
                                  : isDark
                                    ? "bg-slate-950 border-slate-700 text-slate-600 hover:border-slate-500"
                                    : "bg-white border-slate-300 text-slate-400 hover:border-slate-400 shadow-2xs"
                              }`}
                              style={{
                                backgroundColor: isDone ? habit.color : undefined,
                              }}
                            >
                              {isDone ? (
                                <span className="text-xs font-black font-sans leading-none">✓</span>
                              ) : (
                                <span className="text-[9px] font-mono opacity-40">·</span>
                              )}
                            </div>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* DESKTOP VIEW with Exact Circular Ticks */}
                  <div className="hidden sm:grid grid-cols-12 gap-2 items-center">
                    {/* Habit Info */}
                    <div className="col-span-5 sm:col-span-4 flex items-center gap-2.5 min-w-0">
                      <div 
                        className="w-7 h-7 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                        style={{ backgroundColor: habit.color }}
                      >
                        <LucideIcon name={habit.icon} size={14} strokeWidth={2.4} />
                      </div>
                      <span className={`text-xs font-black truncate ${isDark ? "text-white" : "text-slate-950"}`}>{habit.name}</span>
                    </div>

                    {/* Day Indicators - Circular Ticks */}
                    <div className="col-span-5 sm:col-span-6 flex justify-between px-2">
                      {habit.days.map((isDone, dIdx) => (
                        <button
                          key={dIdx}
                          onClick={() => toggleDemoDay(hIdx, dIdx)}
                          className="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer focus:outline-none transition-transform hover:scale-110 active:scale-90"
                          title={`Toggle ${daysOfWeek[dIdx]}`}
                        >
                          <div
                            className={`h-6 w-6 rounded-full flex items-center justify-center transition-all duration-150 border ${
                              isDone
                                ? "text-white border-transparent shadow-xs"
                                : isDark
                                  ? "bg-slate-950 border-slate-700 text-slate-600 hover:border-slate-500"
                                  : "bg-white border-slate-300 text-slate-400 hover:border-slate-400 shadow-2xs"
                            }`}
                            style={{
                              backgroundColor: isDone ? habit.color : undefined,
                            }}
                          >
                            {isDone ? (
                              <span className="text-[10px] font-black font-sans leading-none">✓</span>
                            ) : (
                              <span className="text-[8px] font-mono opacity-30">·</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Streak Counter */}
                    <div className="col-span-2 text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-500/15 text-orange-600 dark:text-orange-400 font-black text-xs border border-orange-500/30">
                        <LucideIcon name="Flame" size={12} strokeWidth={2.4} />
                        <span>{habit.streak}d</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. MEMBERSHIP BENEFITS (Gradient Bento Grid with High-Contrast Text) */}
      <section id="benefits" className={`py-16 sm:py-24 border-t transition-colors ${
        isDark ? "bg-[#090D15] border-slate-800" : "bg-white border-slate-200"
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-200 mb-3 border border-blue-300 dark:border-blue-700">
              Core Capabilities
            </div>
            <h2 className={`text-3xl sm:text-5xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-950"}`}>
              It's a <span className="text-blue-600 dark:text-blue-400">no-brainer.</span>
            </h2>
            <p className={`mt-3 text-base font-semibold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
              Gammy replaces fragmented tracking apps, expensive coaching sessions, and messy spreadsheets with one unified system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b, i) => (
              <div 
                key={i}
                className={`p-7 rounded-3xl border transition-all duration-200 flex flex-col justify-between relative overflow-hidden group hover:scale-[1.01] ${
                  isDark 
                    ? "bg-[#111622] border-slate-800 hover:border-slate-700 shadow-sm" 
                    : "bg-slate-50 border-slate-200 hover:border-slate-300 shadow-xs"
                }`}
              >
                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${b.iconBg} shadow-md shadow-blue-500/20`}>
                    <LucideIcon name={b.icon} size={22} strokeWidth={2.4} />
                  </div>
                  <h3 className={`text-lg font-black ${isDark ? "text-white" : "text-slate-950"}`}>
                    {b.title}
                  </h3>
                  <p className={`mt-2.5 text-xs sm:text-sm leading-relaxed font-semibold ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                    {b.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS (3 Simple Steps) */}
      <section id="how-it-works" className="py-16 sm:py-24 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-200 mb-3 border border-blue-300 dark:border-blue-700">
            How It Works
          </div>
          <h2 className={`text-3xl sm:text-4xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-950"}`}>
            Simplicity at its finest.
          </h2>
          <p className={`mt-2 text-sm sm:text-base font-semibold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
            Track your life in 3 seamless steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`p-7 rounded-3xl border relative overflow-hidden ${
            isDark ? "bg-[#111622] border-slate-800" : "bg-white border-slate-200 shadow-xs"
          }`}>
            <span className={`text-3xl font-black ${isDark ? "text-blue-400" : "text-blue-600"}`}>01</span>
            <h3 className={`text-base font-black mt-4 ${isDark ? "text-white" : "text-slate-950"}`}>Design your matrix</h3>
            <p className={`text-xs mt-2 leading-relaxed font-semibold ${isDark ? "text-slate-200" : "text-slate-700"}`}>
              Select custom habits, daily goals, icons, and frequency targets tailored to your lifestyle.
            </p>
          </div>

          <div className={`p-7 rounded-3xl border relative overflow-hidden ${
            isDark ? "bg-[#111622] border-slate-800" : "bg-white border-slate-200 shadow-xs"
          }`}>
            <span className={`text-3xl font-black ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>02</span>
            <h3 className={`text-base font-black mt-4 ${isDark ? "text-white" : "text-slate-950"}`}>1-click daily tick</h3>
            <p className={`text-xs mt-2 leading-relaxed font-semibold ${isDark ? "text-slate-200" : "text-slate-700"}`}>
              Mark days complete in 2 seconds. The cloud syncs your desktop, phone, and tablet instantly.
            </p>
          </div>

          <div className={`p-7 rounded-3xl border relative overflow-hidden ${
            isDark ? "bg-[#111622] border-slate-800" : "bg-white border-slate-200 shadow-xs"
          }`}>
            <span className={`text-3xl font-black ${isDark ? "text-purple-400" : "text-purple-600"}`}>03</span>
            <h3 className={`text-base font-black mt-4 ${isDark ? "text-white" : "text-slate-950"}`}>Level up with AI</h3>
            <p className={`text-xs mt-2 leading-relaxed font-semibold ${isDark ? "text-slate-200" : "text-slate-700"}`}>
              Get actionable feedback, break plateaus, and maintain streaks with 24/7 AI behavioral guidance.
            </p>
          </div>
        </div>
      </section>

      {/* 6. COMPARISON TABLE */}
      <section id="comparison" className={`py-16 sm:py-24 border-t transition-colors ${
        isDark ? "bg-[#090D15] border-slate-800" : "bg-slate-50 border-slate-200"
      }`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className={`text-3xl sm:text-4xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-950"}`}>
              Why Gammy is different.
            </h2>
          </div>

          <div className={`rounded-3xl border overflow-hidden ${
            isDark ? "bg-[#111622] border-slate-800" : "bg-white border-slate-200 shadow-sm"
          }`}>
            <div className={`grid grid-cols-12 p-4 sm:p-5 font-black text-xs border-b ${
              isDark ? "border-slate-800 text-white" : "border-slate-200 text-slate-950"
            }`}>
              <div className="col-span-6 sm:col-span-8">Capabilities</div>
              <div className={`col-span-3 sm:col-span-2 text-center font-black ${isDark ? "text-blue-400" : "text-blue-600"}`}>Gammy</div>
              <div className={`col-span-3 sm:col-span-2 text-center font-black ${isDark ? "text-slate-300" : "text-slate-700"}`}>Clunky Apps</div>
            </div>

            {comparisonRows.map((row, idx) => (
              <div 
                key={idx} 
                className={`grid grid-cols-12 p-4 sm:p-5 items-center text-xs sm:text-sm border-b last:border-0 ${
                  isDark ? "border-slate-800" : "border-slate-200"
                } ${
                  idx % 2 === 0 ? (isDark ? "bg-slate-900/60" : "bg-slate-50") : ""
                }`}
              >
                <div className={`col-span-6 sm:col-span-8 font-extrabold ${isDark ? "text-slate-100" : "text-slate-950"}`}>
                  {row.feature}
                </div>
                <div className="col-span-3 sm:col-span-2 flex justify-center text-emerald-600 dark:text-emerald-400 font-black">
                  <LucideIcon name="CheckCircle2" size={18} strokeWidth={2.4} />
                </div>
                <div className="col-span-3 sm:col-span-2 flex justify-center text-rose-500/70 dark:text-rose-400/80">
                  <LucideIcon name="XCircle" size={18} strokeWidth={2.4} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS */}
      <section id="faq" className={`py-16 sm:py-24 border-t transition-colors ${
        isDark ? "bg-[#090D15] border-slate-800" : "bg-slate-50 border-slate-200"
      }`}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-3 border ${
              isDark ? "bg-slate-800 text-slate-100 border-slate-700" : "bg-slate-200 text-slate-900 border-slate-300"
            }`}>
              FAQs
            </div>
            <h2 className={`text-3xl sm:text-4xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-950"}`}>
              Frequently asked questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div 
                key={i}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isDark ? "bg-[#111622] border-slate-800" : "bg-white border-slate-200"
                }`}
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full p-5 text-left flex justify-between items-center gap-4 cursor-pointer"
                >
                  <span className={`text-sm font-black ${isDark ? "text-white" : "text-slate-950"}`}>
                    {faq.q}
                  </span>
                  <LucideIcon 
                    name={activeFaq === i ? "ChevronUp" : "ChevronDown"} 
                    size={16} 
                    strokeWidth={2.4}
                    className={`${isDark ? "text-slate-200" : "text-slate-800"} shrink-0`} 
                  />
                </button>
                {activeFaq === i && (
                  <div className={`px-5 pb-5 text-xs sm:text-sm font-semibold leading-relaxed border-t pt-3 ${
                    isDark ? "border-slate-800 text-slate-200" : "border-slate-100 text-slate-700"
                  }`}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. BOLD FOOTER */}
      <footer className={`py-16 sm:py-24 border-t transition-colors relative overflow-hidden ${
        isDark ? "bg-[#070A11] border-slate-800" : "bg-[#FAFAFB] border-slate-200"
      }`}>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-t from-blue-600/15 via-purple-600/10 to-transparent blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <h2 className={`text-4xl sm:text-6xl font-black tracking-tight leading-tight ${
            isDark ? "text-white" : "text-slate-950"
          }`}>
            Level up your daily habits.
          </h2>
          <p className={`mt-4 text-sm sm:text-base font-semibold max-w-md mx-auto ${isDark ? "text-slate-200" : "text-slate-700"}`}>
            Join thousands of founders and high-performers building unbreakable routines today.
          </p>

          <div className="mt-8 flex justify-center">
            <button
              onClick={() => onOpenAuth("signup")}
              className="px-8 py-4 rounded-full text-xs font-black text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 shadow-xl shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              Start tracking free
            </button>
          </div>

          <div className={`mt-16 pt-8 border-t flex flex-col sm:flex-row items-center justify-between text-xs font-bold gap-4 ${
            isDark ? "border-slate-800 text-slate-200" : "border-slate-200 text-slate-800"
          }`}>
            <div className="flex items-center gap-2">
              <GammyLogo size={20} />
              <span className={`font-black ${isDark ? "text-white" : "text-slate-950"}`}>Gammy</span>
              <span className={isDark ? "text-slate-300 font-bold" : "text-slate-700 font-bold"}>© {new Date().getFullYear()} All rights reserved.</span>
            </div>
            <div className={`flex items-center gap-6 ${isDark ? "text-slate-200" : "text-slate-800"}`}>
              <button onClick={() => onOpenAuth("login")} className="hover:underline cursor-pointer font-bold">Sign in</button>
              <a href="#benefits" className="hover:underline font-bold">Benefits</a>
              <a href="#comparison" className="hover:underline font-bold">Comparison</a>
              <a href="#faq" className="hover:underline font-bold">FAQ</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
