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
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;
  colorTheme: string;
  setColorTheme: (theme: string) => void;
  onReturn: () => void;
  triggerToast: (msg: string) => void;
}

export const AccountView: React.FC<AccountViewProps> = ({
  isDark,
  theme,
  setTheme,
  colorTheme,
  setColorTheme,
  onReturn,
  triggerToast,
}) => {
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem("sabit_profile_name") || "Anoop Brown";
  });
  const [userEmail, setUserEmail] = useState(() => {
    const stored = localStorage.getItem("sabit_profile_email");
    if (stored) return stored;
    return localStorage.getItem("sabit_profile_name") === "Anup Sharma" ? "anup.sharma@sabit.ai" : "anoopbrown0@gmail.com";
  });
  const [profileLocation, setProfileLocation] = useState(() => {
    return localStorage.getItem("sabit_profile_location") || "Gurgaon, India";
  });
  const [profileBio, setProfileBio] = useState(() => {
    return localStorage.getItem("sabit_profile_bio") || "High-performance individual cultivating daily consistency, resilience, and laser-focused attention to craft long-term positive routines.";
  });
  const [personalMission, setPersonalMission] = useState(
    "Build unstoppable physical & mental momentum through small deliberate daily choices."
  );
  const [mindsetFocus, setMindsetFocus] = useState("discipline");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
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
        setUserEmail(customEvent.detail === "Anoop Brown" ? "anoopbrown0@gmail.com" : "anup.sharma@sabit.ai");
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
    if (file.size > 1.5 * 1024 * 1024) {
      triggerToast("Image should be smaller than 1.5MB for local storage.");
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
        triggerToast("Profile picture updated successfully!");
      } catch (err) {
        triggerToast("Could not save image: local storage quota exceeded.");
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
      triggerToast("Profile picture reset to default initials.");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const saveProfile = () => {
    setIsEditing(false);
    localStorage.setItem("sabit_profile_name", userName);
    localStorage.setItem("sabit_profile_email", userEmail);
    localStorage.setItem("sabit_profile_location", profileLocation);
    localStorage.setItem("sabit_profile_bio", profileBio);
    
    // Dispatch custom events to update rest of application instantly
    window.dispatchEvent(new CustomEvent("sabit_profile_changed", { detail: userName }));
    triggerToast("Identity profile settings saved successfully!");
  };

  const currentFirstLetter = userName ? userName.charAt(0).toUpperCase() : "A";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Profile Summary banner */}
      <div className={`p-5 md:p-6 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
        isDark 
          ? "bg-slate-900 border-slate-800" 
          : "bg-white border-slate-200 shadow-xs"
      }`}>
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className={`w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center text-white font-black text-lg shadow-sm border-2 ${
              isDark ? "border-slate-800 bg-slate-800" : "border-slate-100 bg-[#2563EB]"
            }`}>
              {profileImage ? (
                <img src={profileImage} alt={userName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                currentFirstLetter
              )}
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
              <LucideIcon name="Check" size={8} className="text-white" />
            </span>
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              User Settings
            </span>
            <h1 className={`text-base font-bold tracking-tight ${isDark ? "text-white" : "text-[#0F172A]"}`}>
              {userName}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage profile information, theme options, and daily habit goals
            </p>
          </div>
        </div>
        <button
          onClick={onReturn}
          className="text-xs font-bold px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-xs cursor-pointer transition-transform active:scale-95"
        >
          Back to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Profile Card Form */}
        <div className={`lg:col-span-7 p-6 rounded-2xl border space-y-6 ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100 shadow-sm"
        }`}>
          
          {/* Section: Image upload & Management */}
          <div className="space-y-3">
            <h4 className={`text-[10px] font-extrabold uppercase tracking-widest ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Profile Picture Management
            </h4>
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`p-5 rounded-2xl border-2 border-dashed flex flex-col sm:flex-row items-center gap-4 transition-all ${
                isDragging 
                  ? "border-[#2563EB] bg-[#2563EB]/5 scale-[1.01]" 
                  : isDark ? "border-slate-800 hover:border-slate-700 bg-slate-950/25" : "border-slate-200 hover:border-slate-300 bg-slate-50/40"
              }`}
            >
              <div className="relative group select-none cursor-pointer shrink-0" onClick={() => fileInputRef.current?.click()}>
                <div className={`w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center text-white font-black text-xl shadow-md border ${
                  isDark ? "border-slate-800 bg-slate-800" : "border-slate-200 bg-[#7C3AED]"
                }`}>
                  {profileImage ? (
                    <img src={profileImage} alt={userName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    currentFirstLetter
                  )}
                </div>
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity flex flex-col items-center justify-center text-[8px] font-bold text-white">
                  <LucideIcon name="Camera" size={14} />
                  <span>UPLOAD</span>
                </div>
              </div>

              <div className="flex-1 text-center sm:text-left">
                <p className={`text-xs font-bold ${isDark ? "text-slate-200" : "text-[#0F172A]"}`}>
                  Drag & Drop avatar photo here
                </p>
                <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                  Supports JPEG, PNG or WebP formats. Max file size: 1.5MB to maintain perfect offline state velocity.
                </p>
                <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[10px] font-bold px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    Select Local File
                  </button>
                  {profileImage && (
                    <button
                      onClick={handleResetAvatar}
                      className={`text-[10px] font-bold px-3.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                        isDark 
                          ? "bg-slate-850 border-slate-750 text-red-400 hover:bg-slate-800" 
                          : "bg-white border-slate-200 text-red-600 hover:bg-slate-50"
                      }`}
                    >
                      Reset Photo
                    </button>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            </div>
          </div>

          <div className={`border-t ${isDark ? "border-slate-800" : "border-slate-100"}`}></div>

          {/* Section: Theme selection */}
          <div className="space-y-4">
            <div>
              <h4 className={`text-[10px] font-extrabold uppercase tracking-widest ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Theme Customization
              </h4>
              <p className="text-[9px] text-slate-400 mt-0.5">Control the ambient visual lightness of the workspace.</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "light", label: "Light Mode", icon: "Sun", color: "text-amber-500" },
                { id: "dark", label: "Dark Mode", icon: "Moon", color: "text-blue-400" },
                { id: "system", label: "System Theme", icon: "Monitor", color: "text-purple-500" },
              ].map((item) => {
                const isSelected = theme === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setTheme(item.id as "light" | "dark" | "system");
                      triggerToast(`Switched theme workspace configuration to ${item.label}!`);
                    }}
                    className={`p-3.5 rounded-xl border flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#2563EB] bg-[#2563EB]/5 text-[#2563EB] font-black scale-101 shadow-sm"
                        : isDark
                          ? "border-slate-800 hover:border-slate-700 bg-slate-950/10 text-slate-300"
                          : "border-slate-200 hover:border-slate-300 bg-white text-slate-700 shadow-2xs"
                    }`}
                  >
                    <LucideIcon name={item.icon} size={16} className={isSelected ? "animate-pulse" : item.color} />
                    <span className="text-[10px] font-extrabold uppercase tracking-wider">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Dynamic Accent Color Theme Selector */}
            <div className="pt-2">
              <label className={`text-[10px] font-extrabold uppercase tracking-widest block mb-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Workspace Accent Color Theme
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[
                  { id: "blue", label: "Blue", hex: "#2563EB", bg: "bg-blue-600" },
                  { id: "purple", label: "Purple", hex: "#7C3AED", bg: "bg-purple-600" },
                  { id: "emerald", label: "Emerald", hex: "#10B981", bg: "bg-emerald-600" },
                  { id: "rose", label: "Rose", hex: "#F43F5E", bg: "bg-rose-600" },
                  { id: "amber", label: "Amber", hex: "#D97706", bg: "bg-amber-600" },
                  { id: "indigo", label: "Indigo", hex: "#4F46E5", bg: "bg-indigo-600" },
                ].map((color) => {
                  const isSelected = colorTheme === color.id;
                  return (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => {
                        setColorTheme(color.id);
                        triggerToast(`Switched workspace accent palette to ${color.label}!`);
                      }}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? "border-[#2563EB] bg-[#2563EB]/5 font-extrabold scale-102"
                          : isDark
                            ? "border-slate-800 hover:border-slate-700 bg-slate-950/10"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full ${color.bg} shadow-xs shrink-0 block`} />
                      <span className="text-[9px] font-bold uppercase tracking-wider">{color.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className={`border-t ${isDark ? "border-slate-800" : "border-slate-100"}`}></div>

          {/* Section: Text details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className={`text-[10px] font-extrabold uppercase tracking-widest ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Identity Details
              </h4>
              {isEditing ? (
                <button
                  onClick={saveProfile}
                  className="text-[10px] font-extrabold text-emerald-500 hover:text-emerald-600 transition-colors uppercase tracking-wider cursor-pointer"
                >
                  Save Profile Details
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-[10px] font-extrabold text-blue-500 hover:text-blue-600 transition-colors uppercase tracking-wider cursor-pointer"
                >
                  Edit Details
                </button>
              )}
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Display Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className={`w-full text-xs p-2.5 rounded-xl border ${
                        isDark ? "bg-slate-850 border-slate-800 text-white focus:border-blue-500" : "bg-slate-50 border-slate-200 text-[#0F172A] focus:border-blue-500"
                      }`}
                    />
                  ) : (
                    <p className={`text-xs font-semibold p-2.5 rounded-xl border ${isDark ? "bg-slate-850/30 border-transparent text-slate-100" : "bg-slate-50/50 border-transparent text-[#0F172A]"}`}>
                      {userName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Secured Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className={`w-full text-xs p-2.5 rounded-xl border ${
                        isDark ? "bg-slate-850 border-slate-800 text-white focus:border-blue-500" : "bg-slate-50 border-slate-200 text-[#0F172A] focus:border-blue-500"
                      }`}
                    />
                  ) : (
                    <p className={`text-xs font-semibold p-2.5 rounded-xl border ${isDark ? "bg-slate-850/30 border-transparent text-slate-100" : "bg-slate-50/50 border-transparent text-[#0F172A]"}`}>
                      {userEmail}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Location (Extended Info)
                </label>
                {isEditing ? (
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <LucideIcon name="MapPin" size={13} />
                    </span>
                    <input
                      type="text"
                      value={profileLocation}
                      onChange={(e) => setProfileLocation(e.target.value)}
                      placeholder="e.g. Gurgaon, India"
                      className={`w-full text-xs py-2.5 pl-9 pr-3 rounded-xl border ${
                        isDark ? "bg-slate-850 border-slate-800 text-white focus:border-blue-500" : "bg-slate-50 border-slate-200 text-[#0F172A] focus:border-blue-500"
                      }`}
                    />
                  </div>
                ) : (
                  <p className={`text-xs font-semibold p-2.5 rounded-xl border flex items-center gap-2 ${isDark ? "bg-slate-850/30 border-transparent text-slate-100" : "bg-slate-50/50 border-transparent text-[#0F172A]"}`}>
                    <LucideIcon name="MapPin" size={13} className="text-red-400" />
                    <span>{profileLocation}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Mindset Primary Focus
                </label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {[
                    { id: "discipline", label: "Pure Discipline", icon: "CheckSquare", color: "text-[#2563EB]" },
                    { id: "health", label: "Peak Vitality", icon: "Dumbbell", color: "text-rose-500" },
                    { id: "leisure", label: "Zen Calmness", icon: "Brain", color: "text-cyan-500" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      disabled={!isEditing}
                      onClick={() => setMindsetFocus(item.id)}
                      className={`p-2.5 rounded-xl border text-[10px] font-bold flex flex-col items-center gap-1.5 transition-all ${
                        mindsetFocus === item.id
                          ? isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-[#0F172A]"
                          : "opacity-60 hover:opacity-100 disabled:opacity-50"
                      }`}
                    >
                      <LucideIcon name={item.icon} size={14} className={item.color} />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Professional Bio (Extended Info)
                </label>
                {isEditing ? (
                  <textarea
                    value={profileBio}
                    rows={3}
                    onChange={(e) => setProfileBio(e.target.value)}
                    placeholder="Enter a brief description of your goals or active focus"
                    className={`w-full text-xs p-2.5 rounded-xl border resize-none ${
                      isDark ? "bg-slate-850 border-slate-800 text-white focus:border-blue-500" : "bg-slate-50 border-slate-200 text-[#0F172A] focus:border-blue-500"
                    }`}
                  />
                ) : (
                  <p className={`text-xs leading-relaxed p-3 rounded-xl border font-medium ${isDark ? "bg-slate-850/30 border-transparent text-slate-300" : "bg-slate-50/50 border-transparent text-slate-600"}`}>
                    {profileBio}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Vision & Goals Side column */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Section: Performance Summary Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-600 to-slate-900 text-white space-y-3 relative overflow-hidden shadow-sm">
            <div className="relative z-10 space-y-2">
              <span className="text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-md bg-white/15 inline-block">
                Consistency Summary
              </span>
              <h3 className="text-sm font-bold tracking-tight">
                {userName.split(" ")[0]}'s Progress Status
              </h3>
              <p className="text-xs text-blue-100 leading-relaxed font-medium">
                You are maintaining an excellent habit completion rate this month. Stay consistent with your daily routines!
              </p>
              <div className="pt-1 flex items-center gap-1.5 text-xs font-bold text-amber-300">
                <LucideIcon name="Award" size={14} className="text-amber-400" />
                <span>Tier 1 Active Tracker</span>
              </div>
            </div>
          </div>

          {/* Section: Personal Mission Statement */}
          <div className={`p-5 rounded-2xl border space-y-3 ${
            isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100 shadow-sm"
          }`}>
            <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-300" : "text-[#0F172A]"}`}>
              Personal Vision Statement
            </h4>
            {isEditing ? (
              <textarea
                value={personalMission}
                rows={3}
                onChange={(e) => setPersonalMission(e.target.value)}
                className={`w-full text-xs p-2.5 rounded-xl border resize-none ${
                  isDark ? "bg-slate-850 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-[#0F172A]"
                }`}
              />
            ) : (
              <p className={`text-xs leading-relaxed italic p-3 rounded-xl border font-medium ${isDark ? "bg-slate-850/50 border-transparent text-slate-300" : "bg-slate-50 border-transparent text-slate-600"}`}>
                "{personalMission}"
              </p>
            )}
          </div>

          {/* Vision Milestones */}
          <div className={`p-5 rounded-2xl border space-y-3 ${
            isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100 shadow-sm"
          }`}>
            <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-300" : "text-[#0F172A]"}`}>
              Personal Vision Milestones
            </h4>
            <div className="space-y-2.5">
              {[
                { label: "Complete 100 days of Sabit ledger tracking", status: "76% Completed", progress: 76, color: "bg-[#2563EB]" },
                { label: "Fulfill daily workout & active routines week", status: "Completed!", progress: 100, color: "bg-emerald-500" },
                { label: "Maintain perfect zen meditation streak", status: "Pending July", progress: 40, color: "bg-cyan-500" },
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-semibold">
                    <span className={isDark ? "text-slate-300" : "text-slate-700"}>{item.label}</span>
                    <span className="font-mono text-slate-400">{item.status}</span>
                  </div>
                  <div className={`w-full h-1.5 rounded-full ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>
                    <div className={`h-full rounded-full transition-all duration-300 ${item.color}`} style={{ width: `${item.progress}%` }} />
                  </div>
                </div>
              ))}
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
  triggerToast: (msg: string) => void;
}

export const SignOutView: React.FC<SignOutViewProps> = ({
  isDark,
  onSignIn,
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
        <div className="inline-flex p-4 rounded-full bg-rose-50 text-rose-500 shadow-sm border border-rose-100">
          <LucideIcon name="ShieldAlert" size={36} className="animate-pulse" />
        </div>
        
        <div>
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#64748B] block">
            Sabit Ledger Authentication
          </span>
          <h2 className={`text-base font-black tracking-tight mt-1 ${isDark ? "text-white" : "text-[#0F172A]"}`}>
            Securely Logged Out
          </h2>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            {firstName}, your habit sessions have been saved safely in local encryption. Swipe the slider to authorize and log back in instantly.
          </p>
        </div>

        {/* Swipe lock indicator */}
        <div className={`p-4 rounded-2xl border relative flex items-center justify-center overflow-hidden ${
          isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"
        }`}>
          {/* Progress fill */}
          <div 
            className="absolute left-0 top-0 bottom-0 bg-blue-500/10 transition-all pointer-events-none" 
            style={{ width: `${sliderVal}%` }}
          />

          <input
            type="range"
            min="0"
            max="100"
            value={sliderVal}
            onChange={handleSliderChange}
            onMouseUp={() => { if (sliderVal < 90) setSliderVal(0); }}
            onTouchEnd={() => { if (sliderVal < 90) setSliderVal(0); }}
            className="w-full h-10 cursor-pointer accent-[#2563EB] opacity-90 relative z-10"
          />

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-[10px] font-extrabold uppercase tracking-widest text-[#2563EB] select-none">
            {sliderVal >= 90 ? "Success!" : sliderVal > 10 ? "Swiping..." : "Swipe to Log In"}
          </div>
        </div>

        <button
          onClick={onSignIn}
          className="w-full py-3 bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:from-[#1D4ED8] hover:to-[#6D28D9] text-white text-[11px] font-bold rounded-xl shadow-md transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {/* Custom clean Google icon */}
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.71 0 3.28.625 4.505 1.664l2.42-2.42C17.39 1.614 14.935 1 12.24 1 6.64 1 2 5.64 2 11.24s4.64 10.24 10.24 10.24c5.795 0 10.254-4.074 10.254-10.24 0-.695-.08-1.355-.22-1.955H12.24z"/>
          </svg>
          <span>Connect with Google Account</span>
        </button>

        <button
          onClick={() => {
            triggerToast("Guest session restored instantly!");
            onSignIn(); // fallback guest sign in
          }}
          className={`w-full py-2.5 border text-[10px] font-bold rounded-xl transition-all cursor-pointer ${
            isDark ? "bg-slate-800 border-slate-750 text-slate-300 hover:bg-slate-700" : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
          }`}
        >
          Continue as Guest ({firstName})
        </button>
      </div>
    </div>
  );
};
