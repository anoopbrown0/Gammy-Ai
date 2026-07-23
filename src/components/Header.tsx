import React, { useState, useRef, useEffect } from "react";
import LucideIcon from "./LucideIcon";
import { GammyLogo } from "./GammyLogo";

interface HeaderProps {
  currentMonth: string;
  setCurrentMonth: (month: string) => void;
  currentYear: string;
  setCurrentYear: (year: string) => void;
  currentDay: number;
  setCurrentDay: (day: number) => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  colorTheme?: string;
  setColorTheme?: (theme: string) => void;
  onNotificationClick: () => void;
  user?: any;
  onSignInWithGoogle?: () => void;
  onSignOut?: () => void;
  onResetProgress?: () => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

const months = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

const getDaysInMonth = (monthName: string, yearStr: string): number => {
  const mIdx = months.indexOf(monthName);
  const year = parseInt(yearStr);
  return new Date(year, mIdx + 1, 0).getDate();
};

const getFirstDayOfWeek = (monthName: string, yearStr: string): number => {
  const mIdx = months.indexOf(monthName);
  const year = parseInt(yearStr);
  return new Date(year, mIdx, 1).getDay();
};

const motivationalQuotes = [
  "Consistency turns small actions into extraordinary results.",
  "Small daily wins build massive long-term success.",
  "Focus on today's habit — future you will be grateful.",
  "Every tick is a vote for the person you want to become.",
  "Discipline is choosing between what you want now and what you want most."
];

export const Header: React.FC<HeaderProps> = ({
  currentMonth,
  setCurrentMonth,
  currentYear,
  setCurrentYear,
  currentDay,
  setCurrentDay,
  isDark,
  setIsDark,
  colorTheme = "blue",
  setColorTheme,
  onNotificationClick,
  user = null,
  onSignInWithGoogle,
  onSignOut,
  onResetProgress,
  activeTab = "dashboard",
  setActiveTab,
}) => {
  const [unreadNotifications, setUnreadNotifications] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showProfileHub, setShowProfileHub] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const profileHubRef = useRef<HTMLDivElement>(null);

  const [quoteIndex, setQuoteIndex] = useState(0);

  const handleNextQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % motivationalQuotes.length);
  };

  const [profileName, setProfileName] = useState(() => {
    return localStorage.getItem("sabit_profile_name") || "Anoop Brown";
  });
  const [profileEmail, setProfileEmail] = useState(() => {
    return localStorage.getItem("sabit_profile_email") || "anoopbrown0@gmail.com";
  });

  const [topHeading, setTopHeading] = useState(() => {
    return localStorage.getItem("sabit_top_heading") || "Habit Tracker";
  });
  const [isEditingHeading, setIsEditingHeading] = useState(false);
  const [headingInput, setHeadingInput] = useState(topHeading);

  useEffect(() => {
    if (user) {
      setProfileName(user.displayName || "Anoop Brown");
      setProfileEmail(user.email || "anoopbrown0@gmail.com");
    }
  }, [user]);

  useEffect(() => {
    const handleHeadingChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setTopHeading(customEvent.detail);
        setHeadingInput(customEvent.detail);
      }
    };
    window.addEventListener("sabit_top_heading_changed", handleHeadingChange);
    return () => {
      window.removeEventListener("sabit_top_heading_changed", handleHeadingChange);
    };
  }, []);

  const handleSaveHeading = () => {
    const val = headingInput.trim() || "Habit Tracker";
    setTopHeading(val);
    setIsEditingHeading(false);
    localStorage.setItem("sabit_top_heading", val);
    window.dispatchEvent(new CustomEvent("sabit_top_heading_changed", { detail: val }));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
      if (profileHubRef.current && !profileHubRef.current.contains(event.target as Node)) {
        setShowProfileHub(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handlePrevMonth = () => {
    const currentIdx = months.indexOf(currentMonth);
    let newIdx = currentIdx - 1;
    let newYear = parseInt(currentYear);
    if (newIdx < 0) {
      newIdx = 11;
      newYear -= 1;
    }
    const newMonth = months[newIdx];
    setCurrentMonth(newMonth);
    setCurrentYear(String(newYear));
    
    const daysInNewMonth = getDaysInMonth(newMonth, String(newYear));
    if (currentDay > daysInNewMonth) {
      setCurrentDay(daysInNewMonth);
    }
  };

  const handleNextMonth = () => {
    const currentIdx = months.indexOf(currentMonth);
    let newIdx = currentIdx + 1;
    let newYear = parseInt(currentYear);
    if (newIdx > 11) {
      newIdx = 0;
      newYear += 1;
    }
    const newMonth = months[newIdx];
    setCurrentMonth(newMonth);
    setCurrentYear(String(newYear));
    
    const daysInNewMonth = getDaysInMonth(newMonth, String(newYear));
    if (currentDay > daysInNewMonth) {
      setCurrentDay(daysInNewMonth);
    }
  };

  const handleSelectDay = (day: number) => {
    setCurrentDay(day);
    setShowCalendar(false);
    window.dispatchEvent(new CustomEvent("sabit_date_changed", {
      detail: { day, month: currentMonth, year: currentYear }
    }));
  };

  const handleJumpToToday = () => {
    const today = new Date();
    const m = months[today.getMonth()] || "July";
    const y = String(today.getFullYear()) || "2026";
    const d = today.getDate() || 21;
    setCurrentMonth(m);
    setCurrentYear(y);
    setCurrentDay(d);
    setShowCalendar(false);
    window.dispatchEvent(new CustomEvent("sabit_date_changed", {
      detail: { day: d, month: m, year: y }
    }));
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDayIndex = getFirstDayOfWeek(currentMonth, currentYear);
  const blanks = Array(firstDayIndex).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const gridItems = [...blanks, ...days];

  useEffect(() => {
    const handleProfileChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (!user) {
        setProfileName(customEvent.detail);
        setProfileEmail(customEvent.detail === "Anoop Brown" ? "anoopbrown0@gmail.com" : "anup.sharma@sabit.ai");
      }
    };
    window.addEventListener("sabit_profile_changed", handleProfileChange);
    return () => {
      window.removeEventListener("sabit_profile_changed", handleProfileChange);
    };
  }, [user]);

  const userInitial = user?.displayName ? user.displayName.charAt(0).toUpperCase() : profileName.charAt(0).toUpperCase();

  return (
    <header 
      id="sabit-header"
      className="flex items-center justify-between gap-3 pb-3 mb-4 sm:mb-6 border-b transition-colors duration-300 relative z-30 border-slate-200/80 dark:border-slate-800"
    >
      {/* Left: GAMMY 3D Isometric Logo & Top Heading with Motivational Subheading */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div 
          onClick={() => setActiveTab && setActiveTab("dashboard")} 
          className="flex items-center gap-3 cursor-pointer group shrink-0"
          title="GAMMY - Habit Tracker & Success Platform"
        >
          <GammyLogo size={40} />
          <div className="flex flex-col leading-none">
            <div className="flex items-center gap-1.5">
              <span className={`text-xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                Gam<span className="text-blue-600">my</span>
              </span>
            </div>
          </div>
        </div>

        <div className={`h-8 w-[1px] hidden sm:block ${isDark ? "bg-slate-800" : "bg-slate-200"}`} />

        {/* Top Heading & Subheading Motivational Section */}
        <div className="min-w-0 hidden sm:flex flex-col justify-center gap-0.5">
          <div className="flex items-center gap-2">
            {isEditingHeading ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={headingInput}
                  onChange={(e) => setHeadingInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveHeading()}
                  autoFocus
                  className={`text-xs font-bold px-2 py-0.5 rounded border outline-none ${
                    isDark ? "bg-slate-800 border-slate-600 text-slate-100" : "bg-white border-slate-300 text-slate-900"
                  }`}
                />
                <button
                  type="button"
                  onClick={handleSaveHeading}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
                  title="Save Heading"
                >
                  <LucideIcon name="Check" size={12} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 group/heading">
                <h1 
                  onClick={() => setIsEditingHeading(true)}
                  className={`text-sm font-extrabold tracking-tight truncate cursor-pointer ${isDark ? "text-slate-100 hover:text-white" : "text-slate-900 hover:text-blue-600"}`}
                  title="Click to edit top heading"
                >
                  {topHeading}
                </h1>
                <button
                  type="button"
                  onClick={() => setIsEditingHeading(true)}
                  className="opacity-0 group-hover/heading:opacity-100 transition-opacity p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  title="Edit top heading"
                >
                  <LucideIcon name="Edit3" size={11} />
                </button>
              </div>
            )}
          </div>

          {/* Motivational Subheading */}
          <div className="flex items-center gap-1.5 text-[11px] font-medium transition-all">
            <span className="flex items-center gap-1 text-amber-500 font-bold shrink-0">
              <LucideIcon name="Sparkles" size={11} className="animate-pulse text-amber-500" />
            </span>
            <p className={`truncate italic max-w-xs md:max-w-sm lg:max-w-md ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              "{motivationalQuotes[quoteIndex]}"
            </p>
            <button
              type="button"
              onClick={handleNextQuote}
              className="p-0.5 rounded text-slate-400 hover:text-blue-500 transition-colors cursor-pointer shrink-0 opacity-70 hover:opacity-100"
              title="Next motivational quote"
            >
              <LucideIcon name="RotateCcw" size={10} />
            </button>
          </div>
        </div>
      </div>

      {/* Right Controls Area */}
      <div className="flex items-center gap-2 shrink-0">

          {/* Unified Interactive Date Picker */}
          <div className="relative" ref={calendarRef}>
            <button
              id="header-date-picker-btn"
              type="button"
              onClick={() => setShowCalendar(!showCalendar)}
              className={`h-8 px-3 border rounded-lg text-xs font-medium shadow-xs transition-all flex items-center gap-2 cursor-pointer ${
                isDark 
                  ? "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800" 
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <LucideIcon name="Calendar" size={13} className="text-slate-500" />
              <span className="font-semibold">{currentMonth} {currentDay}, {currentYear}</span>
              <LucideIcon name="ChevronDown" size={11} className="text-slate-400 transition-transform duration-200" style={{ transform: showCalendar ? 'rotate(180deg)' : 'none' }} />
            </button>

            {showCalendar && (
              <>
                <div 
                  className="fixed inset-0 bg-slate-950/20 dark:bg-black/40 backdrop-blur-xs z-40 transition-opacity cursor-pointer"
                  onClick={() => setShowCalendar(false)}
                />
                <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 p-4 rounded-xl shadow-xl z-50 border transition-all duration-200 flex flex-col gap-3 animate-zoom-in ${
                  isDark 
                    ? "bg-slate-900 border-slate-800 text-slate-100" 
                    : "bg-white border-slate-200 text-slate-900"
                }`}>
                  <div className="flex items-center justify-between font-semibold pb-2 border-b border-slate-100 dark:border-slate-800">
                    <button 
                      type="button"
                      onClick={handlePrevMonth}
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-slate-500"
                    >
                      <LucideIcon name="ChevronLeft" size={14} />
                    </button>
                    <span className="text-xs font-bold tracking-tight">
                      {currentMonth} {currentYear}
                    </span>
                    <button 
                      type="button"
                      onClick={handleNextMonth}
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-slate-500"
                    >
                      <LucideIcon name="ChevronRight" size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center font-bold uppercase text-[9px] text-slate-400">
                    <span>Su</span>
                    <span>Mo</span>
                    <span>Tu</span>
                    <span>We</span>
                    <span>Th</span>
                    <span>Fr</span>
                    <span>Sa</span>
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {gridItems.map((item, idx) => {
                      if (item === null) {
                        return <div key={`empty-${idx}`} />;
                      }
                      const isSelected = item === currentDay;
                      return (
                        <button
                          key={`day-${item}`}
                          type="button"
                          onClick={() => handleSelectDay(item)}
                          className={`h-7 w-7 flex items-center justify-center rounded text-[10px] font-semibold transition-all cursor-pointer ${
                            isSelected
                              ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                              : isDark 
                                ? "text-slate-300 hover:bg-slate-800" 
                                : "text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          {item}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={handleJumpToToday}
                    className="w-full py-1.5 mt-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold rounded text-[10px] hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer text-center"
                  >
                    Jump to Today
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Notification Icon */}
          <button
            id="header-notification-btn"
            onClick={() => {
              setUnreadNotifications(false);
              onNotificationClick();
            }}
            className={`w-8 h-8 border rounded-lg flex items-center justify-center shadow-xs active:scale-95 transition-all relative cursor-pointer ${
              isDark 
                ? "bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800" 
                : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
            title="Notifications"
          >
            <LucideIcon name="Bell" size={14} />
            {unreadNotifications && (
              <span className={`absolute top-1.5 right-1.5 block h-1.5 w-1.5 rounded-full bg-slate-800 dark:bg-slate-100 ring-2 ${isDark ? "ring-slate-900" : "ring-white"}`} />
            )}
          </button>

          <div className={`h-4 w-[1px] ${isDark ? "bg-slate-800" : "bg-slate-200"}`} />

          {/* Profile Hub Button */}
          <div className="relative" ref={profileHubRef}>
            <button
              id="sabit-header-profile-btn"
              onClick={() => setShowProfileHub(!showProfileHub)}
              className={`h-8 px-2 sm:px-2.5 border rounded-lg flex items-center gap-2 transition-all duration-150 cursor-pointer ${
                showProfileHub
                  ? isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-100 border-slate-300 text-slate-900"
                  : isDark ? "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
              title="Profile & Account Management"
            >
              <div className="w-5 h-5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-[10px] flex items-center justify-center overflow-hidden shrink-0 border border-slate-300/50 dark:border-slate-700/50">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt={profileName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span>{userInitial}</span>
                )}
              </div>

              <span className={`text-xs font-semibold truncate max-w-[90px] hidden sm:inline ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                {profileName.split(" ")[0]}
              </span>

              <LucideIcon name="ChevronDown" size={11} className={`text-slate-400 transition-transform duration-200 ${showProfileHub ? "rotate-180" : ""}`} />
            </button>

            {/* Profile Hub Dropdown */}
            {showProfileHub && (
              <div 
                id="header-profile-hub-dropdown"
                className={`absolute right-0 top-10 w-72 p-3 rounded-xl shadow-lg z-50 border transition-all duration-150 space-y-3 animate-fade-in ${
                  isDark 
                    ? "bg-slate-900 border-slate-800 text-slate-200" 
                    : "bg-white border-slate-200 text-slate-900"
                }`}
              >
                {/* User Info Header */}
                <div className={`p-2.5 rounded-lg border flex items-center gap-2.5 ${
                  isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200/80"
                }`}>
                  <div className="w-9 h-9 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center overflow-hidden shrink-0 border border-slate-300 dark:border-slate-700">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt={profileName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <span>{userInitial}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold truncate">{profileName}</h4>
                    <p className="text-[10px] text-slate-400 truncate">{profileEmail}</p>
                  </div>
                </div>

                {/* Profile Hub Navigation & System Items */}
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block px-2 mb-1">
                    Profile & Views
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      if (setActiveTab) setActiveTab("account");
                      setShowProfileHub(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium text-left transition-colors cursor-pointer ${
                      isDark ? "hover:bg-slate-800 text-slate-200" : "hover:bg-slate-100 text-slate-800"
                    }`}
                  >
                    <LucideIcon name="User" size={13} className="text-slate-400" />
                    <span>View Profile & Settings</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (setActiveTab) setActiveTab("performance");
                      setShowProfileHub(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium text-left transition-colors cursor-pointer ${
                      isDark ? "hover:bg-slate-800 text-slate-200" : "hover:bg-slate-100 text-slate-800"
                    }`}
                  >
                    <LucideIcon name="Zap" size={13} className="text-slate-400" />
                    <span>Performance Matrix</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (setActiveTab) setActiveTab("progress");
                      setShowProfileHub(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium text-left transition-colors cursor-pointer ${
                      isDark ? "hover:bg-slate-800 text-slate-200" : "hover:bg-slate-100 text-slate-800"
                    }`}
                  >
                    <LucideIcon name="BarChart3" size={13} className="text-slate-400" />
                    <span>Analytics Overview</span>
                  </button>
                </div>

                {/* System Actions */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent("sabit_trigger_mantra"));
                      setShowProfileHub(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium text-left transition-colors cursor-pointer ${
                      isDark ? "hover:bg-slate-800 text-slate-200" : "hover:bg-slate-100 text-slate-800"
                    }`}
                  >
                    <LucideIcon name="Sparkles" size={13} className="text-slate-400" />
                    <span>Success Mantra</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent("sabit_trigger_beast"));
                      setShowProfileHub(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium text-left transition-colors cursor-pointer ${
                      isDark ? "hover:bg-slate-800 text-slate-200" : "hover:bg-slate-100 text-slate-800"
                    }`}
                  >
                    <LucideIcon name="Flame" size={13} className="text-slate-400" />
                    <span>Toggle Beast Mode</span>
                  </button>

                  {onResetProgress && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm("Are you sure you want to reset all recorded ticks for this month?")) {
                          onResetProgress();
                        }
                        setShowProfileHub(false);
                      }}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium text-left transition-colors cursor-pointer ${
                        isDark ? "hover:bg-slate-800 text-slate-300" : "hover:bg-slate-100 text-slate-700"
                      }`}
                    >
                      <LucideIcon name="RotateCcw" size={13} className="text-slate-400" />
                      <span>Reset Month Progress</span>
                    </button>
                  )}
                </div>

                {/* Auth Actions */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                  <button
                    type="button"
                    onClick={async () => {
                      if (onSignInWithGoogle) {
                        await onSignInWithGoogle();
                      }
                      setShowProfileHub(false);
                    }}
                    className={`w-full py-1.5 px-3 border text-xs font-medium rounded-md transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      isDark 
                        ? "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-750" 
                        : "bg-slate-900 border-slate-900 text-white hover:bg-slate-800"
                    }`}
                  >
                    <span>{user ? "Switch Google Account" : "Sign In with Google"}</span>
                  </button>

                  {user && onSignOut && (
                    <button
                      type="button"
                      onClick={() => {
                        onSignOut();
                        setShowProfileHub(false);
                      }}
                      className={`w-full py-1.5 px-3 border text-xs font-medium rounded-md transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        isDark ? "border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800" : "border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      <LucideIcon name="LogOut" size={12} />
                      <span>Sign Out</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
    </header>
  );
};

export default Header;
