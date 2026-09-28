import React, { useState } from "react";
import { LucideIcon } from "./LucideIcon";
import { GammyLogo } from "./GammyLogo";
import InteractiveGrid from "./InteractiveGrid";

interface LandingScreenProps {
  onOpenAuth: (mode: "login" | "signup") => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  onOpenPayment?: () => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({
  onOpenAuth,
  isDark,
  setIsDark,
  onOpenPayment,
}) => {
  // Interactive mini preview for prospective users
  const [demoHabits, setDemoHabits] = useState([
    { id: "1", name: "Deep Focus (90 min)", icon: "Code", color: "#2563EB", streak: 19, days: [true, true, true, true, true, false, true] },
    { id: "2", name: "Morning Meditation", icon: "Brain", color: "#8B5CF6", streak: 14, days: [true, true, true, false, true, true, true] },
    { id: "3", name: "Hydrate (3L Daily)", icon: "Droplets", color: "#06B6D4", streak: 26, days: [true, true, true, true, true, true, true] },
    { id: "4", name: "Strength Training", icon: "Flame", color: "#F97316", streak: 11, days: [true, false, true, true, false, true, true] },
  ]);

  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [reviewCategory, setReviewCategory] = useState<"all" | "tech" | "health" | "founders">("all");

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
      q: "How does the 7-Day 100% Refund Policy work?",
      a: "Every Gammy Pro purchase (Monthly or the ₹299 Lifetime Pass) comes with our ironclad 7-Day 100% Money-Back Guarantee. If you feel Gammy does not help your daily habits and focus, simply email us or message support within 7 days. We issue a full 100% refund directly back to your original UPI account (GPay/PhonePe/Paytm) or credit card within 24 hours. Zero questions asked, zero paperwork."
    },
    {
      q: "What payment methods are supported for the ₹299 Lifetime Pass?",
      a: "We support instant 1-click UPI payments (Google Pay, PhonePe, Paytm, CRED, BHIM) via dynamic QR code, as well as all major Credit & Debit cards (Visa, Mastercard, RuPay, Amex) protected by 256-bit SSL bank-grade encryption."
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

      {/* Narrow Architectural Grid Pattern with Smooth Mouse Movement */}
      <InteractiveGrid density="narrow" />

      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-blue-600/20 via-indigo-600/15 to-transparent blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-96 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-purple-600/15 via-pink-600/10 to-transparent blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-[1600px] left-0 w-[550px] h-[550px] bg-gradient-to-tr from-cyan-600/15 via-blue-600/10 to-transparent blur-[140px] rounded-full pointer-events-none" />

      {/* 1. TOP BAR with Apple Glassmorphism */}
      <header className={`w-full border-b backdrop-blur-2xl sticky top-0 z-50 transition-colors ${
        isDark 
          ? "bg-[#070A11]/75 border-white/10" 
          : "bg-white/75 border-black/5 shadow-xs"
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
            <a href="#reviews" className={`transition-colors font-black ${isDark ? "text-slate-200 hover:text-blue-400" : "text-slate-900 hover:text-blue-600"}`}>Reviews</a>
            <a href="#pricing" className={`transition-colors font-black ${isDark ? "text-slate-200 hover:text-blue-400" : "text-slate-900 hover:text-blue-600"}`}>Pricing</a>
            <a href="#how-it-works" className={`transition-colors font-black ${isDark ? "text-slate-200 hover:text-blue-400" : "text-slate-900 hover:text-blue-600"}`}>How it works</a>
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

            {/* Payment Option on Home Screen - Hidden on mobile view */}
            <button
              onClick={() => onOpenPayment ? onOpenPayment() : onOpenAuth("signup")}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-black px-3.5 py-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all cursor-pointer shadow-xs whitespace-nowrap"
              title="Gammy Pro Lifetime - ₹299"
            >
              <LucideIcon name="Sparkles" size={13} />
              <span>Lifetime ₹299</span>
            </button>

            <button
              onClick={() => onOpenAuth("login")}
              className={`text-xs font-bold px-3 sm:px-4 py-2 rounded-full border transition-all cursor-pointer whitespace-nowrap ${
                isDark
                  ? "border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
                  : "border-slate-300 bg-white/80 text-slate-900 hover:bg-white shadow-xs"
              }`}
            >
              Sign In
            </button>

            <button
              onClick={() => onOpenAuth("signup")}
              className="text-xs font-bold px-3.5 sm:px-5 py-2 rounded-full transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer whitespace-nowrap shadow-md bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 text-white shadow-blue-500/25"
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

        {/* Big Bold Clean Headline */}
        <div className="max-w-4xl mx-auto">
          <h1 className={`text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.12] ${
            isDark ? "text-white" : "text-slate-950"
          }`}>
            Habit tracker which will change your life <br />
            <span className="text-blue-600 dark:text-blue-400 italic font-serif font-normal">
              with real-time progress.
            </span>
          </h1>
        </div>

        {/* Subtitle with High Contrast */}
        <p className={`mt-6 sm:mt-8 text-base sm:text-xl max-w-2xl mx-auto leading-relaxed font-semibold ${
          isDark ? "text-slate-200" : "text-slate-800"
        }`}>
          Habit systems engineered to scale your daily consistency and focus. Live interactive progress, account-isolated cloud synchronization, and 24/7 behavioral AI coaching.
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

      {/* 6.2 WALL OF REAL USER REVIEWS (Modern SaaS Wall of Love) */}
      <section id="reviews" className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30 mb-3">
            <span>★ ★ ★ ★ ★</span>
            <span className="ml-1">Rated 4.96/5.0 by 2,840+ Members</span>
          </div>
          <h2 className={`text-3xl sm:text-5xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-950"}`}>
            Loved by real builders.
          </h2>
          <p className={`mt-3 text-base font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
            Here is what high-performing engineers, founders, and athletes say about building discipline with Gammy.
          </p>

          {/* Social Proof Trust Bar */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-bold">
            <div className={`px-3.5 py-1.5 rounded-full border flex items-center gap-1.5 ${
              isDark ? "bg-[#111622] border-slate-800 text-slate-300" : "bg-slate-100 border-slate-200 text-slate-700"
            }`}>
              <LucideIcon name="ShieldCheck" size={14} className="text-emerald-400" />
              <span>7-Day 100% Refund Protected</span>
            </div>
            <div className={`px-3.5 py-1.5 rounded-full border flex items-center gap-1.5 ${
              isDark ? "bg-[#111622] border-slate-800 text-slate-300" : "bg-slate-100 border-slate-200 text-slate-700"
            }`}>
              <LucideIcon name="Zap" size={14} className="text-amber-400" />
              <span>Instant UPI & Card Access</span>
            </div>
            <div className={`px-3.5 py-1.5 rounded-full border flex items-center gap-1.5 ${
              isDark ? "bg-[#111622] border-slate-800 text-slate-300" : "bg-slate-100 border-slate-200 text-slate-700"
            }`}>
              <LucideIcon name="Flame" size={14} className="text-rose-400" />
              <span>94.2% 60-Day Habit Retention</span>
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {[
              { id: "all", label: "All Reviews (12)" },
              { id: "tech", label: "Tech & Engineers" },
              { id: "founders", label: "Founders & Creators" },
              { id: "health", label: "Health & Athletes" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setReviewCategory(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  reviewCategory === tab.id
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-105"
                    : isDark
                    ? "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                    : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 12 Modern Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              name: "Vikram Malhotra",
              category: "tech",
              role: "Lead Full-Stack Engineer, Bangalore",
              avatar: "VM",
              color: "from-blue-600 to-indigo-600",
              streak: "74-day coding streak",
              verifiedVia: "Google Pay UPI Verified",
              review: "Gammy's 31-day horizontal matrix is the first tracker that doesn't feel like a chore. The instant Google Pay checkout for ₹299 lifetime was effortless, and the AI coach genuinely catches my burnout before it happens.",
            },
            {
              name: "Pooja Sundaram",
              category: "health",
              role: "Product Designer & Marathoner, Mumbai",
              avatar: "PS",
              color: "from-purple-600 to-pink-600",
              streak: "92-day 5AM workout streak",
              verifiedVia: "PhonePe UPI Verified",
              review: "I switched from Notion spreadsheets to Gammy in 5 minutes. The 7-day refund guarantee gave me complete peace of mind, but after 2 days I was already hooked. The clean dark theme and fluid rubber grid are gorgeous.",
            },
            {
              name: "Aditya Roy",
              category: "founders",
              role: "Tech Founder & Seed Investor, Gurugram",
              avatar: "AR",
              color: "from-emerald-600 to-teal-600",
              streak: "58-day meditation streak",
              verifiedVia: "HDFC Card Verified",
              review: "Having my morning stack locked into Gammy increased my deep work output by 40%. Getting lifelong access for ₹299 with zero subscriptions was the easiest ROI decision I've made this year.",
            },
            {
              name: "Dr. Rohan Varma",
              category: "health",
              role: "Medical Resident, AIIMS New Delhi",
              avatar: "RV",
              color: "from-cyan-600 to-blue-600",
              streak: "88-day reading & hydration",
              verifiedVia: "Paytm UPI Verified",
              review: "With my chaotic hospital shifts, the 1-click ticking and offline sync are absolute life-savers. Gammy is blisteringly fast on mobile and desktop without any ads or distractions.",
            },
            {
              name: "Sneha Kapur",
              category: "tech",
              role: "AI Researcher & Author, Hyderabad",
              avatar: "SK",
              color: "from-rose-600 to-orange-600",
              streak: "63-day research writing",
              verifiedVia: "Razorpay Card Verified",
              review: "The Gemini AI integration isn't a gimmick; it analyzes my completion ledger and pinpoints where my evening friction occurs. Plus, the social share completion cards look like high-end Apple keynotes!",
            },
            {
              name: "Karthik Iyer",
              category: "health",
              role: "Staff DevOps Architect, Chennai",
              avatar: "KI",
              color: "from-amber-600 to-yellow-600",
              streak: "110-day zero-alcohol & gym",
              verifiedVia: "Google Pay UPI Verified",
              review: "I've tried Streaks, Habitica, and Todoist. None of them match Gammy's horizontal 31-day visual bird's eye view. The ₹299 lifetime deal with UPI was instantaneous.",
            },
            {
              name: "Ananya Deshmukh",
              category: "founders",
              role: "Indie Hacker & Creator, Pune",
              avatar: "AD",
              color: "from-fuchsia-600 to-purple-600",
              streak: "46-day daily shipping",
              verifiedVia: "BHIM UPI Verified",
              review: "The friction-free UI is unmatched. Most habit apps try to gamify with silly RPG pets; Gammy treats you like a focused professional. Clean typography and obsidian dark mode.",
            },
            {
              name: "Marcus Vance",
              category: "tech",
              role: "Senior iOS Engineer, London",
              avatar: "MV",
              color: "from-indigo-600 to-violet-600",
              streak: "81-day Swift practice",
              verifiedVia: "Visa Card Verified",
              review: "The spring physics on the matrix grid and the keyboard shortcuts feel so native. Knowing there is a 7-day refund policy made it a no-brainer, but I'll be using this forever.",
            },
            {
              name: "Tanya Mehta",
              category: "health",
              role: "UX Lead & Yoga Practitioner, Bangalore",
              avatar: "TM",
              color: "from-teal-600 to-emerald-600",
              streak: "104-day pranayama streak",
              verifiedVia: "PhonePe UPI Verified",
              review: "The daily audio mantras and completion celebrations give me that quick dopamine hit to stay disciplined. It feels like an app designed by people who actually care about craft.",
            },
            {
              name: "Aman Singhania",
              category: "founders",
              role: "D2C Brand Founder, Jaipur",
              avatar: "AS",
              color: "from-blue-600 to-cyan-600",
              streak: "70-day P&L review daily",
              verifiedVia: "ICICI Card Verified",
              review: "Running a business requires relentless execution. Gammy holds me accountable to the non-negotiables every single morning. Best ₹299 I ever spent.",
            },
            {
              name: "Devika Nair",
              category: "tech",
              role: "Neurobiology Researcher, Kochi",
              avatar: "DN",
              color: "from-purple-600 to-pink-600",
              streak: "55-day circadian sleep tracking",
              verifiedVia: "Google Pay UPI Verified",
              review: "The scientific focus on visual streak continuity is backed by behavioral psychology. It removes executive dysfunction by showing exactly what needs to be checked off today.",
            },
            {
              name: "Zackary Chen",
              category: "founders",
              role: "Remote Product Lead, Singapore",
              avatar: "ZC",
              color: "from-rose-600 to-red-600",
              streak: "95-day cold shower & journal",
              verifiedVia: "Mastercard Verified",
              review: "Super clean, zero bloated menus, instant sync across my MacBook and iPhone. The ₹299 lifetime price is an absolute steal compared to $10/month subscription traps.",
            },
          ]
            .filter((item) => reviewCategory === "all" || item.category === reviewCategory)
            .map((item, i) => (
              <div
                key={i}
                className={`p-6 rounded-3xl border transition-all duration-200 flex flex-col justify-between ${
                  isDark 
                    ? "bg-[#111622] border-slate-800 hover:border-slate-700 shadow-sm" 
                    : "bg-white border-slate-200 hover:border-slate-300 shadow-xs"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1 text-amber-400 text-xs">
                      <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                    </div>
                    <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <LucideIcon name="CheckCircle2" size={10} />
                      <span>{item.verifiedVia}</span>
                    </span>
                  </div>

                  <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? "text-slate-200" : "text-slate-700"} font-medium`}>
                    "{item.review}"
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800/60 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${item.color} text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs`}>
                      {item.avatar}
                    </div>
                    <div className="min-w-0">
                      <h5 className={`text-xs font-black truncate ${isDark ? "text-white" : "text-slate-950"}`}>
                        {item.name}
                      </h5>
                      <p className={`text-[10px] truncate ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        {item.role}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono font-bold text-amber-500 dark:text-amber-400 shrink-0 ml-2">
                    🔥 {item.streak.split(" ")[0]}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* 6.5 MEMBERSHIP PRICING (ONE OPTION ONLY: ₹299 FOR LIFETIME ACCESS) */}
      <section id="pricing" className="py-16 sm:py-24 max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 mb-3 border border-emerald-500/30">
            <LucideIcon name="ShieldCheck" size={13} />
            <span>7-Day 100% Refund Policy</span>
          </div>
          <h2 className={`text-3xl sm:text-4xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-950"}`}>
            Simple lifetime access
          </h2>
          <p className={`mt-2 text-sm font-semibold ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Pay once, track forever. Risk-free with 7-day money-back guarantee.
          </p>
        </div>

        {/* Clean Minimal Lifetime Card */}
        <div className={`p-6 sm:p-8 rounded-3xl border-2 border-emerald-500/80 relative shadow-2xl transition-all ${
          isDark ? "bg-gradient-to-b from-[#10221A] to-[#0D151F] shadow-emerald-500/10" : "bg-gradient-to-b from-emerald-50/70 to-white shadow-emerald-500/15"
        }`}>
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="text-base sm:text-lg font-black text-emerald-400">Gammy Pro Lifetime Pass</h3>
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              ONE-TIME ₹299
            </span>
          </div>

          <div className="flex items-baseline gap-1 my-3">
            <span className="text-5xl font-black font-mono text-emerald-400">₹299</span>
            <span className="text-xs text-slate-400 font-semibold">one-time payment • lifetime access</span>
          </div>

          <p className="text-xs text-slate-400 mb-5 leading-relaxed font-medium">
            Permanent unlimited access forever with live progress synchronization. Zero recurring monthly fees.
          </p>

          {/* Minimal 4 Bullet Points */}
          <div className="space-y-2.5 text-xs font-semibold max-w-md">
            <div className="flex items-center gap-2.5">
              <LucideIcon name="Check" size={15} className="text-emerald-400 shrink-0" />
              <span>Full Lifetime Pro Access & unlimited habits</span>
            </div>
            <div className="flex items-center gap-2.5">
              <LucideIcon name="Check" size={15} className="text-emerald-400 shrink-0" />
              <span>Real-time cloud sync across all devices</span>
            </div>
            <div className="flex items-center gap-2.5">
              <LucideIcon name="Check" size={15} className="text-emerald-400 shrink-0" />
              <span>24/7 AI Behavior Coach & audio mantras</span>
            </div>
            <div className="flex items-center gap-2.5 text-emerald-400 font-bold">
              <LucideIcon name="Check" size={15} className="text-emerald-400 shrink-0" />
              <span>7-Day 100% Full Money-Back Guarantee</span>
            </div>
          </div>

          <button
            onClick={() => onOpenPayment ? onOpenPayment() : onOpenAuth("signup")}
            className="mt-6 w-full py-4 px-4 rounded-2xl text-xs sm:text-sm font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white shadow-xl shadow-emerald-500/30 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <LucideIcon name="Sparkles" size={16} />
            <span>Get Lifetime Access for ₹299</span>
          </button>

          {/* Minimal Accepted Payment & Refund Footer */}
          <div className="mt-4 pt-3.5 border-t border-slate-200/20 dark:border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <LucideIcon name="ShieldCheck" size={13} />
              7-Day 100% Refund Policy (No Questions Asked)
            </span>
            <span>Instant UPI (GPay, PhonePe, Paytm) & Cards</span>
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
