import React, { useState, useEffect } from "react";
import LucideIcon from "./LucideIcon";
import { Habit } from "../types";
import ProgressChart from "./ProgressChart";

// PERFORMANCE VIEW: High-Impact Performance Scorecard and habit insights
interface PerformanceViewProps {
  habits: Habit[];
  currentMonth: string;
  currentYear: string;
  currentDay?: number;
  viewMode: "week" | "month";
  successRate: number;
  monthlyAchievement: number;
  habitScore: number;
  isDark: boolean;
  onReturn: () => void;
}

export const PerformanceView: React.FC<PerformanceViewProps> = ({
  habits,
  currentMonth,
  currentYear,
  currentDay = 20,
  viewMode,
  successRate,
  monthlyAchievement,
  habitScore,
  isDark,
  onReturn,
}) => {
  const [activeMetric, setActiveMetric] = useState<"consistency" | "velocity" | "focus">("consistency");
  const [profileName, setProfileName] = useState(() => {
    return localStorage.getItem("sabit_profile_name") || "Anoop Brown";
  });

  useEffect(() => {
    const handleProfileChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setProfileName(customEvent.detail);
      }
    };
    window.addEventListener("sabit_profile_changed", handleProfileChange);
    return () => {
      window.removeEventListener("sabit_profile_changed", handleProfileChange);
    };
  }, []);

  const firstName = profileName.split(" ")[0];

  // Calculate stats
  const totalRoutines = habits.length;
  const todayIdx = currentDay - 1;
  const completedToday = habits.filter((h) => h.days && h.days[todayIdx] === "completed").length;
  const currentStreakRecord = habits.reduce((max, h) => Math.max(max, h.streak), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className={`p-6 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
        isDark 
          ? "bg-gradient-to-r from-slate-900 to-blue-950 border-slate-800" 
          : "bg-gradient-to-r from-white to-blue-50/55 border-slate-100 shadow-sm"
      }`}>
        <div>
          <span className={`text-[9px] font-extrabold uppercase tracking-widest ${isDark ? "text-blue-400" : "text-blue-600"}`}>
            Sabit Ledger Engine
          </span>
          <h1 className={`text-base font-black tracking-tight mt-1 ${isDark ? "text-white" : "text-[#0F172A]"}`}>
            {firstName}'s Performance Matrix
          </h1>
          <p className={`text-[10px] mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Real-time metric breakdown and consistency index
          </p>
        </div>
        <button
          onClick={onReturn}
          className="text-[10px] font-bold px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-xs cursor-pointer transition-transform hover:scale-102 active:scale-98"
        >
          Back to Dashboard
        </button>
      </div>

      {/* Grid containing performance breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Metric Selection list */}
        <div className="lg:col-span-4 space-y-3">
          <div className={`p-4 rounded-2xl border ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100 shadow-xs"}`}>
            <h3 className={`text-xs font-bold mb-3 uppercase tracking-wider ${isDark ? "text-slate-300" : "text-[#0F172A]"}`}>
              Select Index
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => setActiveMetric("consistency")}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  activeMetric === "consistency"
                    ? "border-[#2563EB] bg-[#2563EB]/5 text-[#2563EB] font-bold"
                    : isDark ? "border-slate-800 hover:border-slate-700 text-slate-300" : "border-slate-100 hover:border-slate-200 text-[#0F172A]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LucideIcon name="CheckCircle2" size={14} />
                  <span className="text-xs">Consistency Ratio</span>
                </div>
                <span className="text-xs font-mono">{successRate}%</span>
              </button>

              <button
                onClick={() => setActiveMetric("velocity")}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  activeMetric === "velocity"
                    ? "border-purple-500 bg-purple-500/5 text-purple-500 font-bold"
                    : isDark ? "border-slate-800 hover:border-slate-700 text-slate-300" : "border-slate-100 hover:border-slate-200 text-[#0F172A]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LucideIcon name="Zap" size={14} />
                  <span className="text-xs">Streak Velocity</span>
                </div>
                <span className="text-xs font-mono">+{currentStreakRecord}d</span>
              </button>

              <button
                onClick={() => setActiveMetric("focus")}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  activeMetric === "focus"
                    ? "border-emerald-500 bg-emerald-500/5 text-emerald-500 font-bold"
                    : isDark ? "border-slate-800 hover:border-slate-700 text-slate-300" : "border-slate-100 hover:border-slate-200 text-[#0F172A]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LucideIcon name="Target" size={14} />
                  <span className="text-xs">Habit Power Score</span>
                </div>
                <span className="text-xs font-mono">{habitScore}/100</span>
              </button>
            </div>
          </div>

          {/* Quick Motivational Stat Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-indigo-900 text-white space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-purple-200">
              Personal Goal Velocity
            </h4>
            <p className="text-xs leading-relaxed font-medium">
              "Every repetition is a vote for the person you want to become. You are maintaining a masterfully consistent path, Anoop."
            </p>
            <div className="pt-2 flex items-center gap-2 text-[10px] font-bold text-purple-200 uppercase tracking-wider">
              <LucideIcon name="Award" size={12} />
              <span>Current Status: Top 2% Performer</span>
            </div>
          </div>
        </div>

        {/* Chart View Panel */}
        <div className={`lg:col-span-8 p-5 rounded-2xl border ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100 shadow-sm"
        }`}>
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className={`text-xs font-extrabold uppercase tracking-wider ${isDark ? "text-slate-300" : "text-[#0F172A]"}`}>
                Historical Velocity Overview
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Calculated across {viewMode === "week" ? "current 7 active days" : "full 31 days calendar matrix"}
              </p>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded bg-[#2563EB]/10 text-[#2563EB] font-bold uppercase tracking-wider">
              {currentMonth} {currentYear}
            </span>
          </div>

          {/* Re-render the beautiful D3/Recharts wrapper */}
          <div className="h-[220px]">
            <ProgressChart
              habits={habits}
              currentMonth={currentMonth}
              currentYear={currentYear}
              viewMode={viewMode}
              isDark={isDark}
            />
          </div>

          {/* Breakdown grids */}
          <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-150 dark:border-slate-800 text-center">
            <div>
              <span className="text-[9px] text-[#64748B] uppercase font-bold tracking-wider">Routines Tracked</span>
              <p className={`text-base font-black mt-1 ${isDark ? "text-white" : "text-[#0F172A]"}`}>
                {totalRoutines}
              </p>
            </div>
            <div>
              <span className="text-[9px] text-[#64748B] uppercase font-bold tracking-wider">Today Completed</span>
              <p className="text-base font-black text-emerald-500 mt-1">
                {completedToday}
              </p>
            </div>
            <div>
              <span className="text-[9px] text-[#64748B] uppercase font-bold tracking-wider">Peak Streak</span>
              <p className="text-base font-black text-purple-500 mt-1">
                {currentStreakRecord} days
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


// ACCOUNT VIEW: Anoop's Profile & Personalized Success Hub
interface AccountViewProps {
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;
  colorTheme: string;
  setColorTheme: (theme: string) => void;
  onReturn: () => void;
  triggerToast: (msg: string) => void;
}

export const AccountView: React.FC<AccountViewProps> = ({
  isDark,
  setIsDark,
  theme,
  setTheme,
  colorTheme,
  setColorTheme,
  onReturn,
  triggerToast,
}) => {
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem("sabit_profile_name") || "User";
  });
  const [userEmail, setUserEmail] = useState(() => {
    return localStorage.getItem("sabit_profile_email") || "user@gammy.app";
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Sync avatar image from local storage
  const syncAvatar = () => {
    try {
      const img = localStorage.getItem("sabit_banner_image");
      setProfileImage(img);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    syncAvatar();
    window.addEventListener("sabit_profile_image_updated", syncAvatar);
    
    const handleProfileChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setUserName(customEvent.detail);
      }
    };
    window.addEventListener("sabit_profile_changed", handleProfileChange);

    return () => {
      window.removeEventListener("sabit_profile_image_updated", syncAvatar);
      window.removeEventListener("sabit_profile_changed", handleProfileChange);
    };
  }, []);

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      triggerToast("Please select a valid image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      triggerToast("Image should be smaller than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setProfileImage(base64);
      try {
        localStorage.setItem("sabit_banner_image", base64);
        window.dispatchEvent(new Event("sabit_profile_image_updated"));
        window.dispatchEvent(new CustomEvent("sabit_profile_changed", { detail: userName }));
        triggerToast("Profile picture updated.");
      } catch (err) {
        triggerToast("Could not save image: storage limit reached.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleResetAvatar = (e: React.MouseEvent) => {
    e.stopPropagation();
    setProfileImage(null);
    try {
      localStorage.removeItem("sabit_banner_image");
      window.dispatchEvent(new Event("sabit_profile_image_updated"));
      window.dispatchEvent(new CustomEvent("sabit_profile_changed", { detail: userName }));
      triggerToast("Profile picture removed.");
    } catch (err) {
      console.error(err);
    }
  };

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;

    setIsSaving(true);
    localStorage.setItem("sabit_profile_name", userName.trim());
    localStorage.setItem("sabit_profile_email", userEmail.trim());
    
    window.dispatchEvent(new CustomEvent("sabit_profile_changed", { detail: userName.trim() }));
    
    setTimeout(() => {
      setIsSaving(false);
      triggerToast("Profile saved successfully.");
    }, 200);
  };

  const handleResetHabits = () => {
    window.dispatchEvent(new CustomEvent("sabit_reset_progress"));
    setShowConfirmReset(false);
    triggerToast("All habit progress has been reset.");
  };

  const currentFirstLetter = userName ? userName.charAt(0).toUpperCase() : "U";

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className={`text-xl sm:text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
            Account & Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your personal profile, appearance, and habit tracking preferences.
          </p>
        </div>
        <button
          onClick={onReturn}
          className={`self-start sm:self-center px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer ${
            isDark 
              ? "bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800" 
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs"
          }`}
        >
          <LucideIcon name="ArrowLeft" size={14} />
          <span>Back to Tracker</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Column: Profile Card */}
        <div className={`md:col-span-7 p-6 rounded-2xl border ${
          isDark ? "bg-slate-900/90 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900 shadow-xs"
        }`}>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-5 flex items-center gap-2">
            <LucideIcon name="User" size={16} className="text-[#007AFF]" />
            <span>Profile Information</span>
          </h2>

          {/* Avatar Section */}
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className={`w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-sm border ${
              isDark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-[#007AFF]"
            }`}>
              {profileImage ? (
                <img src={profileImage} alt={userName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                currentFirstLetter
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-[#007AFF] hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Change Photo
                </button>
                {profileImage && (
                  <button
                    type="button"
                    onClick={handleResetAvatar}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                      isDark ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                JPG, PNG or WebP under 2MB.
              </p>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={saveProfile} className="space-y-4 pt-6">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                required
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  isDark 
                    ? "bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500" 
                    : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400"
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="Enter your email"
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  isDark 
                    ? "bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500" 
                    : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400"
                }`}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 bg-[#007AFF] hover:bg-blue-600 active:scale-98 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Theme & Workspace Settings */}
        <div className="md:col-span-5 space-y-6">
          
          {/* Appearance Card */}
          <div className={`p-6 rounded-2xl border ${
            isDark ? "bg-slate-900/90 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900 shadow-xs"
          }`}>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
              <LucideIcon name="Palette" size={16} className="text-purple-500" />
              <span>Appearance</span>
            </h2>

            {/* Theme Toggle */}
            <div className="space-y-2 mb-5">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                Interface Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "light", label: "Bright / Light", icon: "Sun" },
                  { id: "dark", label: "Dark Mode", icon: "Moon" },
                ].map((item) => {
                  const isSelected = item.id === "dark" ? isDark : !isDark;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        const wantDark = item.id === "dark";
                        setTheme(item.id as "light" | "dark");
                        setIsDark(wantDark);
                        triggerToast(`Switched to ${item.id === "dark" ? "Dark Mode" : "Bright Mode"}.`);
                      }}
                      className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#007AFF] text-white border-[#007AFF] shadow-sm"
                          : isDark
                            ? "bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <LucideIcon name={item.icon} size={15} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Accent Colors */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                Accent Color
              </label>
              <div className="grid grid-cols-6 gap-2">
                {[
                  { id: "blue", hex: "#2563EB", bg: "bg-blue-600" },
                  { id: "purple", hex: "#7C3AED", bg: "bg-purple-600" },
                  { id: "emerald", hex: "#10B981", bg: "bg-emerald-600" },
                  { id: "rose", hex: "#F43F5E", bg: "bg-rose-600" },
                  { id: "amber", hex: "#D97706", bg: "bg-amber-600" },
                  { id: "indigo", hex: "#4F46E5", bg: "bg-indigo-600" },
                ].map((c) => {
                  const isSelected = colorTheme === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setColorTheme(c.id);
                        triggerToast(`Accent color updated.`);
                      }}
                      className={`h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                        isSelected 
                          ? "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900 border-transparent" 
                          : isDark ? "border-slate-800 hover:border-slate-700" : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full ${c.bg} shadow-xs`} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Account Data & Safety Card */}
          <div className={`p-6 rounded-2xl border ${
            isDark ? "bg-slate-900/90 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900 shadow-xs"
          }`}>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
              <LucideIcon name="Shield" size={16} className="text-emerald-500" />
              <span>Data & Management</span>
            </h2>

            <div className="space-y-3">
              <div className={`p-3 rounded-xl border flex items-center gap-3 ${
                isDark ? "bg-slate-800/40 border-slate-700/60" : "bg-slate-50 border-slate-200/80"
              }`}>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold">Cloud Sync Active</p>
                  <p className="text-[11px] text-slate-400 truncate">Habit ledger saved securely.</p>
                </div>
              </div>

              {!showConfirmReset ? (
                <button
                  type="button"
                  onClick={() => setShowConfirmReset(true)}
                  className={`w-full py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    isDark 
                      ? "border-slate-800 text-rose-400 hover:bg-rose-950/20" 
                      : "border-slate-200 text-rose-600 hover:bg-rose-50"
                  }`}
                >
                  <LucideIcon name="RotateCcw" size={14} />
                  <span>Reset All Habit Progress</span>
                </button>
              ) : (
                <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 space-y-2">
                  <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                    Are you sure you want to reset all checkboxes to default?
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResetHabits}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
                    >
                      Yes, Reset
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowConfirmReset(false)}
                      className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};


// SIGN OUT VIEW: Simulates secure logout with quick interactive re-entry
interface SignOutViewProps {
  isDark: boolean;
  onSignIn: () => void;
  onGoToLanding?: () => void;
  triggerToast: (msg: string) => void;
}

export const SignOutView: React.FC<SignOutViewProps> = ({
  isDark,
  onSignIn,
  onGoToLanding,
  triggerToast,
}) => {
  const [sliderVal, setSliderVal] = useState(0);
  const [profileName, setProfileName] = useState(() => {
    return localStorage.getItem("sabit_profile_name") || "Anoop Brown";
  });

  useEffect(() => {
    const handleProfileChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setProfileName(customEvent.detail);
      }
    };
    window.addEventListener("sabit_profile_changed", handleProfileChange);
    return () => {
      window.removeEventListener("sabit_profile_changed", handleProfileChange);
    };
  }, []);

  const firstName = profileName.split(" ")[0];

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setSliderVal(val);
    if (val >= 90) {
      triggerToast("Welcome back! Secured connection restored.");
      onSignIn();
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 animate-fade-in text-center select-none max-w-lg mx-auto">
      <div className={`w-full p-8 rounded-3xl border shadow-xl space-y-6 ${
        isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-100 text-slate-900"
      }`}>
        <div className="inline-flex p-4 rounded-full bg-blue-500/10 text-blue-600 shadow-sm border border-blue-500/20">
          <LucideIcon name="Sparkles" size={36} className="animate-pulse" />
        </div>
        
        <div>
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#64748B] block">
            Gammy AI Habit Tracker
          </span>
          <h2 className={`text-base font-black tracking-tight mt-1 ${isDark ? "text-white" : "text-[#0F172A]"}`}>
            Signed Out
          </h2>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            {firstName}, your habit ledger is saved in secure cloud persistence. Return to the Gammy home website or sign back in anytime.
          </p>
        </div>

        {onGoToLanding && (
          <button
            onClick={onGoToLanding}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <LucideIcon name="Home" size={15} />
            <span>Go to Gammy Home Page</span>
          </button>
        )}

        <button
          onClick={onSignIn}
          className={`w-full py-3 border text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
            isDark ? "bg-slate-800 border-slate-700 text-white hover:bg-slate-750" : "bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100"
          }`}
        >
          <LucideIcon name="Mail" size={15} />
          <span>Sign In / Register</span>
        </button>

        <button
          onClick={() => {
            triggerToast("Guest workspace restored!");
            onSignIn(); // fallback guest sign in
          }}
          className={`w-full py-2.5 border text-[10px] font-semibold rounded-xl transition-all cursor-pointer ${
            isDark ? "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          Explore Workspace as Guest ({firstName})
        </button>
      </div>
    </div>
  );
};
