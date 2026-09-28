import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
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
  isGlassMode?: boolean;
  setIsGlassMode?: (glass: boolean) => void;
  colorTheme?: string;
  setColorTheme?: (theme: string) => void;
  onNotificationClick: () => void;
  user?: any;
  onOpenAuthModal?: () => void;
  onSignOut?: () => void;
  onGoToLanding?: () => void;
  onResetProgress?: () => void;
  onOpenShareModal?: () => void;
  onOpenPaymentModal?: () => void;
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

const getTimeBasedGreeting = (): string => {
  return "Good Morning";
};

export const Header: React.FC<HeaderProps> = ({
  currentMonth,
  setCurrentMonth,
  currentYear,
  setCurrentYear,
  currentDay,
  setCurrentDay,
  isDark,
  setIsDark,
  isGlassMode = true,
  setIsGlassMode,
  onNotificationClick,
  user = null,
  onOpenAuthModal,
  onSignOut,
  onGoToLanding,
  onResetProgress,
  onOpenShareModal,
  onOpenPaymentModal,
  activeTab = "dashboard",
  setActiveTab,
}) => {
  const [unreadNotifications, setUnreadNotifications] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showProfileHub, setShowProfileHub] = useState(false);

  const [profileName, setProfileName] = useState(() => {
    return user?.displayName || localStorage.getItem("sabit_profile_name") || "User";
  });
  const [profileImage, setProfileImage] = useState<string | null>(() => {
    return user?.photoURL || localStorage.getItem("sabit_banner_image") || null;
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileInput, setProfileInput] = useState(profileName);

  const calendarRef = useRef<HTMLDivElement>(null);
  const profileHubRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.displayName) {
      setProfileName(user.displayName);
      setProfileInput(user.displayName);
    } else if (user?.email) {
      const raw = user.email.split("@")[0];
      const clean = raw.replace(/[0-9._-]+$/, "") || raw;
      const formatted = clean.charAt(0).toUpperCase() + clean.slice(1);
      setProfileName(formatted);
      setProfileInput(formatted);
    }
    if (user?.photoURL) {
      setProfileImage(user.photoURL);
    }
  }, [user]);

  useEffect(() => {
    const handleAvatarUpdate = () => {
      try {
        const saved = localStorage.getItem("sabit_banner_image");
        setProfileImage(saved);
      } catch (_) {}
    };

    const handleProfileChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setProfileName(customEvent.detail);
        setProfileInput(customEvent.detail);
      }
      handleAvatarUpdate();
    };

    window.addEventListener("sabit_profile_image_updated", handleAvatarUpdate);
    window.addEventListener("sabit_profile_changed", handleProfileChange);

    return () => {
      window.removeEventListener("sabit_profile_image_updated", handleAvatarUpdate);
      window.removeEventListener("sabit_profile_changed", handleProfileChange);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setShowCalendar(false);
      }
      if (profileHubRef.current && !profileHubRef.current.contains(e.target as Node)) {
        setShowProfileHub(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleOpenCalendar = () => setShowCalendar(true);
    window.addEventListener("sabit_open_calendar", handleOpenCalendar);
    return () => window.removeEventListener("sabit_open_calendar", handleOpenCalendar);
  }, []);

  const totalDaysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDayOfWeek = getFirstDayOfWeek(currentMonth, currentYear);

  const gridItems = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    gridItems.push(null);
  }
  for (let day = 1; day <= totalDaysInMonth; day++) {
    gridItems.push(day);
  }

  const handlePrevMonth = () => {
    const mIdx = months.indexOf(currentMonth);
    if (mIdx === 0) {
      setCurrentMonth(months[11]);
      setCurrentYear((parseInt(currentYear) - 1).toString());
    } else {
      setCurrentMonth(months[mIdx - 1]);
    }
  };

  const handleNextMonth = () => {
    const mIdx = months.indexOf(currentMonth);
    if (mIdx === 11) {
      setCurrentMonth(months[0]);
      setCurrentYear((parseInt(currentYear) + 1).toString());
    } else {
      setCurrentMonth(months[mIdx + 1]);
    }
  };

  const handleSelectDay = (day: number) => {
    setCurrentDay(day);
    setShowCalendar(false);
    window.dispatchEvent(new CustomEvent("sabit_date_selected", {
      detail: { day, month: currentMonth, year: currentYear }
    }));
  };

  const handleJumpToToday = () => {
    const today = new Date();
    const curM = months[today.getMonth()];
    const curY = today.getFullYear().toString();
    const curD = today.getDate();

    setCurrentMonth(curM);
    setCurrentYear(curY);
    setCurrentDay(curD);
    setShowCalendar(false);
    window.dispatchEvent(new CustomEvent("sabit_date_selected", {
      detail: { day: curD, month: curM, year: curY }
    }));
  };

  const handleSaveProfileName = () => {
    const trimmed = profileInput.trim();
    if (trimmed) {
      setProfileName(trimmed);
      localStorage.setItem("sabit_profile_name", trimmed);
      window.dispatchEvent(new Event("sabit_profile_changed"));
    }
    setIsEditingProfile(false);
  };

  const userInitial = (profileName || "U").charAt(0).toUpperCase();
  const [timeGreeting, setTimeGreeting] = useState(getTimeBasedGreeting);

  const userFirstName = (() => {
    if (user?.displayName && user.displayName.trim()) {
      return user.displayName.split(" ")[0];
    }
    if (profileName && profileName.trim()) {
      return profileName.split(" ")[0];
    }
    if (user?.email) {
      const prefix = user.email.split("@")[0];
      const clean = prefix.replace(/[0-9._-]+$/, "") || prefix;
      return clean.charAt(0).toUpperCase() + clean.slice(1);
    }
    return "";
  })();

  const fullGreeting = userFirstName ? `${timeGreeting}, ${userFirstName}` : timeGreeting;

  useEffect(() => {
    const updateGreeting = () => {
      setTimeGreeting(getTimeBasedGreeting());
    };
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header 
      id="sabit-header"
      className={`sticky top-2 z-30 flex items-center justify-between gap-2.5 sm:gap-3 px-3.5 sm:px-4 py-2.5 sm:py-3 mb-4 sm:mb-6 rounded-2xl border backdrop-blur-xl transition-all duration-300 ${
        isDark
          ? "bg-[#1C1C1E]/80 border-white/10 text-white shadow-lg shadow-black/20"
          : "bg-white/80 border-slate-200/70 text-slate-900 shadow-sm shadow-slate-200/50"
      }`}
    >
      {/* Left Brand Logo & Greeting */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <div 
          onClick={() => setActiveTab && setActiveTab("dashboard")} 
          className="flex items-center gap-2 cursor-pointer group shrink-0 active:scale-95 transition-transform"
          title="Gammy - Habit Tracker"
        >
          <GammyLogo size={30} />
          <span className={`text-base sm:text-lg font-extrabold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
            Gam<span className="text-[#007AFF]">my</span>
          </span>
        </div>

        <div className={`h-6 w-[1px] hidden sm:block ${isDark ? "bg-white/10" : "bg-slate-200"}`} />

        {/* Dynamic Time-Based Greeting with User's Name - Hidden on mobile view (<sm) */}
        <div className="hidden sm:flex flex-col justify-center min-w-0">
          <h1 className="text-xs sm:text-sm md:text-base tracking-tight truncate flex items-center gap-1.5">
            <span className="font-serif italic font-normal text-slate-500 dark:text-slate-400">
              {timeGreeting}{userFirstName ? "," : ""}
            </span>
            {userFirstName && (
              <span className={`font-sans font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                {userFirstName}
              </span>
            )}
          </h1>
        </div>
      </div>

      {/* Right Controls Area */}
      <div className="flex items-center gap-2 shrink-0">

        {/* Date Selector Pill - Restored to previous right controls position */}
        <div className="relative" ref={calendarRef}>
          <button
            id="header-date-picker-btn"
            type="button"
            onClick={() => setShowCalendar(!showCalendar)}
            className={`h-9 px-3.5 rounded-full text-xs font-semibold shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95 ${
              isDark 
                ? "bg-white/10 border border-white/10 text-slate-200 hover:bg-white/15" 
                : "bg-slate-100/90 border border-slate-200/80 text-slate-700 hover:bg-slate-200/80"
            }`}
            title="Click to view centered calendar"
          >
            <LucideIcon name="Calendar" size={14} className="text-[#007AFF]" />
            <span>{currentMonth} {currentDay}, {currentYear}</span>
            <LucideIcon name="ChevronDown" size={12} className="text-slate-400 transition-transform duration-200" style={{ transform: showCalendar ? 'rotate(180deg)' : 'none' }} />
          </button>
        </div>

        {/* Universal Centered Modal Calendar Dialog - Rendered via createPortal into document.body to center on full screen */}
        {showCalendar && typeof document !== "undefined" && createPortal(
          <div 
            className="fixed inset-0 z-[999] flex items-center justify-center p-4 overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label="Select Date Calendar"
          >
            <div 
              className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity cursor-pointer animate-fadeIn"
              onClick={() => setShowCalendar(false)}
            />
            <div className={`relative w-full max-w-xs m-auto p-5 rounded-3xl shadow-2xl z-[1000] border transition-all duration-200 flex flex-col gap-3.5 animate-zoom-in ${
              isDark 
                ? "bg-[#141924]/95 border-white/15 text-slate-100 shadow-black/90 ring-1 ring-white/10" 
                : "bg-white/95 border-slate-200/90 text-slate-900 shadow-slate-400/40"
            }`}>
              {/* Header Month / Year Navigation */}
              <div className="flex items-center justify-between font-semibold pb-2 border-b border-slate-200/70 dark:border-white/10">
                <button 
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  aria-label="Previous Month"
                >
                  <LucideIcon name="ChevronLeft" size={16} />
                </button>
                <span className="text-sm font-extrabold tracking-tight">
                  {currentMonth} {currentYear}
                </span>
                <button 
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  aria-label="Next Month"
                >
                  <LucideIcon name="ChevronRight" size={16} />
                </button>
              </div>

              {/* Day of Week Headers */}
              <div className="grid grid-cols-7 gap-1 text-center font-black uppercase text-[10px] text-slate-500 dark:text-slate-400">
                <span>Su</span>
                <span>Mo</span>
                <span>Tu</span>
                <span>We</span>
                <span>Th</span>
                <span>Fr</span>
                <span>Sa</span>
              </div>

              {/* Days Matrix */}
              <div className="grid grid-cols-7 gap-1.5">
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
                      className={`h-8 w-8 flex items-center justify-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-blue-600 text-white font-black shadow-md shadow-blue-600/30 scale-105"
                          : isDark 
                            ? "text-slate-200 hover:bg-white/10" 
                            : "text-slate-800 hover:bg-slate-100"
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1 border-t border-slate-200/70 dark:border-white/10">
                <button
                  type="button"
                  onClick={handleJumpToToday}
                  className="flex-1 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 font-extrabold rounded-xl text-xs transition-all cursor-pointer text-center"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setShowCalendar(false)}
                  className="px-3.5 py-2 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition-all cursor-pointer text-center"
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* Notification Bell */}
        <button
          id="header-notification-btn"
          onClick={() => {
            setUnreadNotifications(false);
            onNotificationClick();
          }}
          className={`w-9 h-9 rounded-full hidden sm:flex items-center justify-center shadow-xs active:scale-95 transition-all relative cursor-pointer ${
            isDark 
              ? "bg-white/10 border border-white/10 text-slate-200 hover:bg-white/15" 
              : "bg-slate-100/90 border border-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80"
          }`}
          title="Notifications"
        >
          <LucideIcon name="Bell" size={15} />
          {unreadNotifications && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#007AFF] ring-2 ring-white dark:ring-[#1C1C1E]" />
          )}
        </button>


        {/* Dark/Light Mode Switch Toggle */}
        <button
          type="button"
          onClick={() => setIsDark(!isDark)}
          className={`w-9 h-9 rounded-full flex items-center justify-center shadow-xs active:scale-95 transition-all cursor-pointer ${
            isDark 
              ? "bg-white/10 border border-white/10 text-amber-400 hover:bg-white/15" 
              : "bg-slate-100/90 border border-slate-200/80 text-slate-700 hover:bg-slate-200/80"
          }`}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle theme"
        >
          <LucideIcon name={isDark ? "Sun" : "Moon"} size={15} />
        </button>

        {/* Profile / Account Hub Button */}
        <div className="relative" ref={profileHubRef}>
          <button
            id="sabit-header-profile-btn"
            onClick={() => setShowProfileHub(!showProfileHub)}
            className={`w-9 h-9 rounded-full flex items-center justify-center shadow-xs transition-all cursor-pointer active:scale-95 overflow-hidden ${
              showProfileHub
                ? isDark ? "bg-[#007AFF] text-white" : "bg-[#007AFF] text-white"
                : isDark ? "bg-white/10 border border-white/10 text-slate-200 hover:bg-white/15" : "bg-slate-100/90 border border-slate-200/80 text-slate-700 hover:bg-slate-200/80"
            }`}
            title="Profile & Account"
          >
            {profileImage ? (
              <img src={profileImage} alt={profileName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <span className="font-bold text-xs">{userInitial}</span>
            )}
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileHub && (
            <div className={`absolute right-0 mt-2 w-64 p-3 rounded-2xl shadow-xl z-50 border transition-all duration-200 flex flex-col gap-2.5 animate-zoom-in ${
              isDark 
                ? "bg-slate-900 border-slate-800 text-slate-100" 
                : "bg-white border-slate-200 text-slate-900"
            }`}>
              {/* User Info Header */}
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-[#007AFF] text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                  {profileImage ? (
                    <img src={profileImage} alt={profileName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <span>{userInitial}</span>
                  )}
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs font-bold truncate text-slate-900 dark:text-white">{profileName}</span>
                  <span className="text-[10px] text-slate-600 dark:text-slate-300 font-medium truncate">{user?.email || "Local User"}</span>
                </div>
              </div>

              {/* Account Navigation */}
              {setActiveTab && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("account");
                    setShowProfileHub(false);
                  }}
                  className={`w-full py-2 px-3 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                    activeTab === "account"
                      ? "bg-[#007AFF] text-white shadow-sm"
                      : isDark
                        ? "bg-slate-800/60 hover:bg-slate-800 text-slate-200 border border-slate-700/50"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/60"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <LucideIcon name="User" size={14} className={activeTab === "account" ? "text-white" : "text-[#007AFF]"} />
                    <span>Account & Settings</span>
                  </div>
                  <LucideIcon name="ChevronRight" size={12} className="opacity-60" />
                </button>
              )}

              {/* Link to Home Screen */}
              {onGoToLanding && (
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileHub(false);
                    onGoToLanding();
                  }}
                  className={`w-full py-2 px-3 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                    isDark
                      ? "bg-slate-800/60 hover:bg-slate-800 text-slate-200 border border-slate-700/50"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/60"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <LucideIcon name="Home" size={14} className="text-[#007AFF]" />
                    <span>Home & Landing</span>
                  </div>
                  <LucideIcon name="ChevronRight" size={12} className="opacity-60" />
                </button>
              )}

              {/* Account Actions */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-1.5">
                {onResetProgress && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileHub(false);
                      onResetProgress();
                    }}
                    className={`w-full py-1.5 px-3 border text-xs font-medium rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      isDark ? "border-slate-800 text-rose-400 hover:bg-rose-950/30" : "border-slate-200 text-rose-600 hover:bg-rose-50"
                    }`}
                  >
                    <LucideIcon name="RotateCcw" size={12} />
                    <span>Reset Habits</span>
                  </button>
                )}
                {onSignOut && user ? (
                  <button
                    type="button"
                    onClick={() => {
                      onSignOut();
                      setShowProfileHub(false);
                    }}
                    className={`w-full py-1.5 px-3 border text-xs font-medium rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      isDark ? "border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200" : "border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <LucideIcon name="LogOut" size={12} />
                    <span>Sign Out</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenAuthModal?.();
                      setShowProfileHub(false);
                    }}
                    className="w-full py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <LucideIcon name="LogIn" size={12} />
                    <span>Sign In / Register</span>
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
