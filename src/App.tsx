import { useState, useEffect, useRef } from "react";
import Header from "./components/Header";
import MetricCards from "./components/MetricCards";
import ProgressChart from "./components/ProgressChart";
import RightPanels from "./components/RightPanels";
import HabitTrackerTable from "./components/HabitTrackerTable";
import AICoachChat from "./components/AICoachChat";
import { initialHabits } from "./data";
import { Habit } from "./types";
import LucideIcon from "./components/LucideIcon";
import UserBanner from "./components/UserBanner";
import HabitModal from "./components/HabitModal";
import SettingsModal from "./components/SettingsModal";
import { AuthModal } from "./components/AuthModal";
import { PerformanceView, AccountView, SignOutView } from "./components/ExtraViews";
import { 
  onAuthChange, 
  logoutUser, 
  loginWithGoogle,
  subscribeHabits, 
  subscribeHabitLogs, 
  addHabitToFirestore, 
  updateHabitInFirestore, 
  deleteHabitFromFirestore, 
  setHabitLogStatus,
  syncUserProfile
} from "./lib/firestoreService";

const getDateStrForDay = (dayNum: number, monthName: string, yearStr: string) => {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const monthIdx = months.indexOf(monthName);
  const m = monthIdx >= 0 ? String(monthIdx + 1).padStart(2, "0") : "07";
  const d = String(dayNum).padStart(2, "0");
  return `${yearStr}-${m}-${d}`;
};

export default function App() {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months[new Date().getMonth()] || "July";
  });
  const [currentYear, setCurrentYear] = useState(() => String(new Date().getFullYear()) || "2026");
  const [currentDay, setCurrentDay] = useState(() => new Date().getDate() || 21);
  const [activeTab, setActiveTab] = useState("dashboard");

  const [user, setUser] = useState<any | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [loadingCloud, setLoadingCloud] = useState(false);

  // Dynamic habits storage key based on Month and Year
  const habitsKey = `sabit_habits_${currentMonth}_${currentYear}`;

  const [habits, setHabits] = useState<Habit[]>(initialHabits);
  const [habitLogs, setHabitLogs] = useState<any[]>([]);
  
  // Track which key is currently loaded
  const loadedKeyRef = useRef(habitsKey);

  // Subscribe to Firebase Authentication & Real-time Firestore Listeners
  useEffect(() => {
    const checkLocalGuest = () => {
      const storedMock = localStorage.getItem("sabit_mock_user");
      if (storedMock) {
        try {
          return JSON.parse(storedMock);
        } catch (_) {}
      }
      return null;
    };

    const unsubscribeAuth = onAuthChange(async (currentUser) => {
      const activeUser = currentUser || checkLocalGuest();
      setUser(activeUser);
      if (activeUser) {
        if (currentUser) {
          await syncUserProfile(currentUser);
        }
        localStorage.setItem("sabit_profile_name", activeUser.displayName || "Anoop Brown");
        if (activeUser.email) {
          localStorage.setItem("sabit_profile_email", activeUser.email);
        }
        window.dispatchEvent(new CustomEvent("sabit_profile_changed", { detail: activeUser.displayName || "Anoop Brown" }));
      }
    });

    const handleProfileChange = () => {
      const guest = checkLocalGuest();
      if (guest) setUser(guest);
    };
    window.addEventListener("sabit_profile_changed", handleProfileChange);

    return () => {
      unsubscribeAuth();
      window.removeEventListener("sabit_profile_changed", handleProfileChange);
    };
  }, []);

  // Real-time Firestore habits & logs synchronization when user is authenticated
  useEffect(() => {
    if (!user) return;

    setLoadingCloud(true);
    let isInitialHabitSync = true;

    // 1. Subscribe to habits
    const unsubscribeHabits = subscribeHabits(user.uid, async (cloudHabits) => {
      if (cloudHabits && cloudHabits.length > 0) {
        // Map cloud habits to local Habit objects
        const mappedHabits: Habit[] = cloudHabits.map((ch) => ({
          id: ch.id,
          name: ch.name,
          goal: ch.goal || "1x / day",
          color: ch.color || "#2563EB",
          iconName: ch.icon || "Target",
          category: ch.category || "habit",
          active: ch.active !== false,
          streak: 0,
          days: Array(31).fill("locked"),
        }));
        setHabits(mappedHabits);
      } else if (isInitialHabitSync) {
        // Seed default habits for new users
        isInitialHabitSync = false;
        for (const defaultHabit of initialHabits) {
          await addHabitToFirestore(user.uid, {
            name: defaultHabit.name,
            goal: defaultHabit.goal,
            color: defaultHabit.color,
            iconName: defaultHabit.iconName,
            category: defaultHabit.category,
            active: true,
          });
        }
      }
      setLoadingCloud(false);
    });

    // 2. Subscribe to habit logs
    const unsubscribeLogs = subscribeHabitLogs(user.uid, (cloudLogs) => {
      setHabitLogs(cloudLogs);
    });

    return () => {
      unsubscribeHabits();
      unsubscribeLogs();
    };
  }, [user]);

  // Combine habits with habitLogs whenever habits, habitLogs, month, or year changes
  useEffect(() => {
    if (!user || habitLogs.length === 0) return;

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const monthIdx = monthNames.indexOf(currentMonth);
    const monthPrefix = `${currentYear}-${String(monthIdx + 1).padStart(2, "0")}`;

    setHabits((prevHabits) =>
      prevHabits.map((habit) => {
        const newDays: ("completed" | "skipped" | "locked")[] = Array(31).fill("locked");
        
        // Find logs for this habit matching monthPrefix
        const logsForHabit = habitLogs.filter(
          (log) => log.habitId === habit.id && log.date && log.date.startsWith(monthPrefix)
        );

        logsForHabit.forEach((log) => {
          const parts = log.date.split("-");
          if (parts.length === 3) {
            const dayNum = parseInt(parts[2], 10);
            if (dayNum >= 1 && dayNum <= 31) {
              newDays[dayNum - 1] = log.status as "completed" | "skipped" | "locked";
            }
          }
        });

        const newStreak = recalculateStreakAndDays(newDays);
        return {
          ...habit,
          days: newDays,
          streak: newStreak
        };
      })
    );
  }, [habitLogs, currentMonth, currentYear, user]);

  // Save changes to habits dynamically in localStorage as fallback
  useEffect(() => {
    if (typeof window !== "undefined" && !user) {
      if (loadedKeyRef.current === habitsKey) {
        localStorage.setItem(habitsKey, JSON.stringify(habits));
      }
    }
  }, [habits, habitsKey, user]);

  const [colorTheme, setColorTheme] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sabit_color_theme") || "blue";
    }
    return "blue";
  });

  const themeColorsMap: Record<string, { primary: string; hover: string; dark: string; light: string; border: string }> = {
    blue: { primary: "#2563EB", hover: "#1D4ED8", dark: "#60A5FA", light: "rgba(37, 99, 235, 0.12)", border: "rgba(37, 99, 235, 0.25)" },
    purple: { primary: "#7C3AED", hover: "#6D28D9", dark: "#C084FC", light: "rgba(124, 58, 237, 0.12)", border: "rgba(124, 58, 237, 0.25)" },
    emerald: { primary: "#10B981", hover: "#059669", dark: "#34D399", light: "rgba(16, 185, 129, 0.12)", border: "rgba(16, 185, 129, 0.25)" },
    rose: { primary: "#F43F5E", hover: "#E11D48", dark: "#F472B6", light: "rgba(244, 63, 94, 0.12)", border: "rgba(244, 63, 94, 0.25)" },
    amber: { primary: "#D97706", hover: "#B45309", dark: "#FBBF24", light: "rgba(217, 119, 6, 0.12)", border: "rgba(217, 119, 6, 0.25)" },
    indigo: { primary: "#4F46E5", hover: "#4338CA", dark: "#818CF8", light: "rgba(79, 70, 229, 0.12)", border: "rgba(79, 70, 229, 0.25)" }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("sabit_color_theme", colorTheme);
    const colors = themeColorsMap[colorTheme] || themeColorsMap.blue;
    const root = document.documentElement;
    root.style.setProperty("--sabit-primary", colors.primary);
    root.style.setProperty("--sabit-primary-hover", colors.hover);
    root.style.setProperty("--sabit-primary-dark", colors.dark);
    root.style.setProperty("--sabit-primary-light", colors.light);
    root.style.setProperty("--sabit-primary-border", colors.border);
    
    window.dispatchEvent(new CustomEvent("sabit_color_theme_changed", { detail: colorTheme }));
  }, [colorTheme]);

  // Keep date in sync
  useEffect(() => {
    const updateToToday = () => {
      const today = new Date();
      const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      const m = months[today.getMonth()] || "July";
      const y = String(today.getFullYear()) || "2026";
      const d = today.getDate();
      
      setCurrentMonth(m);
      setCurrentYear(y);
      setCurrentDay(d);
    };

    updateToToday();
    const interval = setInterval(updateToToday, 15 * 60 * 1000);
    const handleFocus = () => updateToToday();
    
    if (typeof window !== "undefined") {
      window.addEventListener("focus", handleFocus);
      document.addEventListener("visibilitychange", handleFocus);
    }

    return () => {
      clearInterval(interval);
      if (typeof window !== "undefined") {
        window.removeEventListener("focus", handleFocus);
        document.removeEventListener("visibilitychange", handleFocus);
      }
    };
  }, []);
  
  const [theme, setTheme] = useState<"light">("light");
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("sabit_theme", "light");
    setIsDark(false);
  }, [theme]);

  const [isAICoachOpen, setIsAICoachOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"week" | "month" >("month");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "habit" | "active" | "leisure">("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isBeastMode, setIsBeastMode] = useState(false);
  const [mobileDashboardTab, setMobileDashboardTab] = useState<"ledger" | "reminders">("reminders");
  const [selectedHabitId, setSelectedHabitId] = useState<string>("all");

  const motivationalQuotes = [
    "Don't count the days, make the days count. You've got this, Anoop!",
    "The secret of your future is hidden in your daily routine.",
    "Consistency beats talent every single time. Keep showing up!",
    "Success doesn't come from what you do occasionally, it comes from what you do consistently.",
    "Beast mode is not a setting; it's a state of mind! Unleash it today!",
    "Anoop, your future self is thanking you for not giving up right now.",
    "Discipline is choosing between what you want now and what you want most.",
    "Only 1% of people stick to their habits. You are the 1%, Anoop!",
    "Every day is a clean ledger. Write a masterclass today!"
  ];

  useEffect(() => {
    const handleMantraTrigger = () => {
      const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
      triggerToast(randomQuote);
    };

    const handleBeastTrigger = () => {
      setIsBeastMode(prev => {
        const next = !prev;
        triggerToast(next ? "🔥 BEAST MODE ACTIVATED! 100% focus locked!" : "Beast mode deactivated. Rest and recover.");
        return next;
      });
    };

    const handleCustomToast = (e: Event) => {
      const customEvent = e as CustomEvent;
      triggerToast(customEvent.detail);
    };

    const handleDateChanged = (e: Event) => {
      const customEvent = e as CustomEvent<{ day?: number; month?: string; year?: string }>;
      if (customEvent.detail) {
        if (typeof customEvent.detail.day === "number") setCurrentDay(customEvent.detail.day);
        if (typeof customEvent.detail.month === "string") setCurrentMonth(customEvent.detail.month);
        if (typeof customEvent.detail.year === "string") setCurrentYear(customEvent.detail.year);
      }
    };

    window.addEventListener("sabit_trigger_mantra", handleMantraTrigger);
    window.addEventListener("sabit_trigger_beast", handleBeastTrigger);
    window.addEventListener("sabit_trigger_toast", handleCustomToast);
    window.addEventListener("sabit_date_changed", handleDateChanged);

    return () => {
      window.removeEventListener("sabit_trigger_mantra", handleMantraTrigger);
      window.removeEventListener("sabit_trigger_beast", handleBeastTrigger);
      window.removeEventListener("sabit_trigger_toast", handleCustomToast);
      window.removeEventListener("sabit_date_changed", handleDateChanged);
    };
  }, []);

  // Habit management states
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [selectedHabitForEdit, setSelectedHabitForEdit] = useState<Habit | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const handleOpenAddHabit = () => {
    setSelectedHabitForEdit(null);
    setIsHabitModalOpen(true);
  };

  const handleOpenEditHabit = (habit: Habit) => {
    setSelectedHabitForEdit(habit);
    setIsHabitModalOpen(true);
  };

  const handleSaveHabit = async (habitData: { name: string; goal: string; color: string; iconName: string; category: "habit" | "active" | "leisure"; active?: boolean }) => {
    if (selectedHabitForEdit) {
      // Edit Mode
      if (user) {
        await updateHabitInFirestore(user.uid, selectedHabitForEdit.id, habitData);
      }
      const updatedHabits = habits.map((h) =>
        h.id === selectedHabitForEdit.id
          ? { ...h, ...habitData, streak: recalculateStreakAndDays(h.days) }
          : h
      );
      setHabits(updatedHabits);
      triggerToast(`Habit "${habitData.name}" updated successfully!`);
    } else {
      // Add Mode
      let newHabitId = "h_" + Date.now();
      if (user) {
        const cloudId = await addHabitToFirestore(user.uid, habitData);
        if (cloudId) newHabitId = cloudId;
      }
      const newDays: ("completed" | "skipped" | "locked")[] = Array(31).fill("locked") as any;
      const newHabit: Habit = {
        id: newHabitId,
        name: habitData.name,
        goal: habitData.goal,
        color: habitData.color,
        iconName: habitData.iconName,
        category: habitData.category,
        active: habitData.active !== false,
        streak: 0,
        days: newDays,
      };
      setHabits([...habits, newHabit]);
      triggerToast(`New habit "${habitData.name}" established in the ledger!`);
    }
  };

  const handleDeleteHabit = async () => {
    if (selectedHabitForEdit) {
      if (user) {
        await deleteHabitFromFirestore(user.uid, selectedHabitForEdit.id);
      }
      const updatedHabits = habits.filter((h) => h.id !== selectedHabitForEdit.id);
      setHabits(updatedHabits);
      setIsHabitModalOpen(false);
      triggerToast(`Habit "${selectedHabitForEdit.name}" has been removed.`);
    }
  };

  // Algorithm to calculate individual habit streak
  const recalculateStreakAndDays = (days: ('completed' | 'skipped' | 'locked')[]): number => {
    let currentStreak = 0;
    let lastActiveIdx = -1;
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i] !== "locked") {
        lastActiveIdx = i;
        break;
      }
    }

    if (lastActiveIdx === -1) return 0;

    for (let i = lastActiveIdx; i >= 0; i--) {
      if (days[i] === "completed") {
        currentStreak++;
      } else if (days[i] === "skipped") {
        break;
      }
    }
    return currentStreak;
  };

  // Handles toggling a day in the habits checklist
  const handleToggleDay = async (habitId: string, dayIndex: number, forceStatus?: 'completed' | 'skipped' | 'locked') => {
    const dayNum = dayIndex + 1;
    if (dayNum < currentDay) {
      triggerToast(`Previous days (Day ${dayNum}) are locked and cannot be changed.`);
      return;
    }
    if (dayNum > currentDay) {
      triggerToast(`Future days (Day ${dayNum}) are locked and cannot be logged yet.`);
      return;
    }

    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    const currentStatus = habit.days[dayIndex];
    let nextStatus: 'completed' | 'skipped' | 'locked';
    if (forceStatus) {
      nextStatus = forceStatus;
    } else {
      if (currentStatus === "completed") {
        nextStatus = "skipped";
      } else if (currentStatus === "skipped") {
        nextStatus = "locked";
      } else {
        nextStatus = "completed";
      }
    }

    // Optimistic UI update
    const updatedHabits = habits.map((h) => {
      if (h.id !== habitId) return h;
      const newDays = [...h.days];
      newDays[dayIndex] = nextStatus;
      const newStreak = recalculateStreakAndDays(newDays);
      return { ...h, days: newDays, streak: newStreak };
    });
    setHabits(updatedHabits);

    // Save to Firestore if user is authenticated
    if (user) {
      const dateStr = getDateStrForDay(dayNum, currentMonth, currentYear);
      await setHabitLogStatus(
        user.uid,
        habitId,
        dateStr,
        nextStatus === "locked" ? null : nextStatus
      );
    }

    triggerToast("Habit tick logged in Firestore!");
  };

  // Clear All Ticks - resets ticks for current day/month
  const handleLockAll = async () => {
    const updatedHabits = habits.map((habit) => {
      const newDays = Array(31).fill("locked") as ("completed" | "skipped" | "locked")[];
      return {
        ...habit,
        days: newDays,
        streak: 0
      };
    });
    setHabits(updatedHabits);

    if (user) {
      const dateStr = getDateStrForDay(currentDay, currentMonth, currentYear);
      for (const h of habits) {
        await setHabitLogStatus(user.uid, h.id, dateStr, null);
      }
    }
    triggerToast("All ticks cleared! Ready to record your daily habit tick.");
  };

  const handleTodayClick = () => {
    const today = new Date();
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const m = months[today.getMonth()] || "July";
    const y = String(today.getFullYear()) || "2026";
    const d = today.getDate() || 21;
    setCurrentMonth(m);
    setCurrentYear(y);
    setCurrentDay(d);
    triggerToast(`Navigated focus to today: ${m} ${d}, ${y}`);
  };

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleSettingsClick = () => {
    setIsSettingsOpen(true);
  };

  const handleResetProgress = () => {
    const cleared = habits.map((h) => ({
      ...h,
      days: Array(31).fill("locked") as ("completed" | "skipped" | "locked")[],
      streak: 0,
    }));
    setHabits(cleared);
  };

  const handleDeleteAllHabits = () => {
    setHabits([]);
  };

  const handleNotificationClick = () => {
    triggerToast("Sabit notifications: Your habits are clear and ready to be checked off!");
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
      const dayOfWeek = date.getDay();
      
      const dayOfWeekMondayStart = (dayOfWeek + 6) % 7;
      const startOffset = dayOfWeekMondayStart;
      let startDay = day - startOffset;
      
      if (startDay < 1) startDay = 1;
      if (startDay + 6 > 31) startDay = 25;
      
      return Array.from({ length: 7 }, (_, i) => startDay + i);
    } catch (e) {
      return [20, 21, 22, 23, 24, 25, 26];
    }
  };

  // REACTIVE METRICS CALCULATION
  const activeDaysIndices = viewMode === "week"
    ? getDaysForWeek(currentDay, currentMonth, currentYear).map(d => d - 1)
    : Array.from({ length: 31 }, (_, i) => i);

  const selectedHabit = selectedHabitId !== "all" ? habits.find(h => h.id === selectedHabitId) : null;
  const filteredHabitsForMetrics = selectedHabit 
    ? [selectedHabit] 
    : (selectedCategory === "all" ? habits : habits.filter((h) => h.category === selectedCategory));

  let totalCompleted = 0;
  let totalPossible = filteredHabitsForMetrics.length * activeDaysIndices.length;
  filteredHabitsForMetrics.forEach((h) => {
    activeDaysIndices.forEach((idx) => {
      if (h.days[idx] === "completed") {
        totalCompleted++;
      }
    });
  });
  const successRate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

  let totalProgressPct = 0;
  filteredHabitsForMetrics.forEach((h) => {
    const completed = activeDaysIndices.map(idx => h.days[idx]).filter((d) => d === "completed").length;
    totalProgressPct += (completed / activeDaysIndices.length) * 100;
  });
  const monthlyAchievement = filteredHabitsForMetrics.length > 0 ? Math.round(totalProgressPct / filteredHabitsForMetrics.length) : 0;

  const currentStreak = Math.max(...filteredHabitsForMetrics.map((h) => h.streak), 0);
  const habitScore = Math.min(Math.max(Math.round(successRate * 0.8 + currentStreak * 0.9), 0), 100);

  return (
    <div 
      className={`min-h-screen font-sans antialiased transition-colors duration-300 ${
        isDark ? "bg-slate-950 text-slate-100" : "bg-[#F8FAFC] text-[#0F172A]"
      }`}
    >
      <div className={`min-h-screen max-w-[1600px] mx-auto shadow-[0_20px_80px_rgba(15,23,42,0.04)] border-x transition-all duration-300 relative ${
        isBeastMode ? "ring-4 ring-rose-500/80 shadow-[0_0_50px_rgba(244,63,94,0.4)]" : ""
      } ${
        isDark ? "bg-slate-900 border-slate-800" : "bg-white border-[#E5E7EB]"
      }`}>
        
        {/* Floating Interactive Toast */}
        {toastMessage && (
          <div className={`fixed top-6 left-1/2 -translate-x-1/2 text-xs font-bold py-3 px-5 rounded-xl shadow-xl flex items-center gap-2.5 z-50 border animate-slide-down ${
            isDark ? "bg-slate-900 text-white border-slate-800" : "bg-[#0F172A] text-white border-slate-800"
          }`}>
            <LucideIcon name="Sparkles" size={13} className="text-[#2563EB] animate-spin-slow" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Master Workspace Content Area - Full Width */}
        <main className={`w-full p-3.5 sm:p-5 lg:p-6 flex flex-col min-h-screen transition-colors duration-300 ${
          isDark ? "bg-slate-950" : "bg-[#F8FAFC]"
        }`}>
          
          {/* Header */}
          <Header
            currentMonth={currentMonth}
            setCurrentMonth={setCurrentMonth}
            currentYear={currentYear}
            setCurrentYear={setCurrentYear}
            currentDay={currentDay}
            setCurrentDay={setCurrentDay}
            isDark={isDark}
            setIsDark={setIsDark}
            onNotificationClick={handleNotificationClick}
            onOpenAICoach={() => setIsAICoachOpen(true)}
            user={user}
            onSignInWithGoogle={async () => {
              try {
                await loginWithGoogle();
                triggerToast("Google Sign-In successful!");
              } catch (err: any) {
                triggerToast(err?.message || "Google Sign-In failed.");
              }
            }}
            onSignOut={async () => {
              await logoutUser();
              setUser(null);
              triggerToast("Signed out successfully.");
            }}
            onResetProgress={handleResetProgress}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            colorTheme={colorTheme}
            setColorTheme={setColorTheme}
          />

          {/* Conditional View Router */}
          {activeTab === "dashboard" ? (
            <div className="space-y-6 flex-1">
              
              {/* Top Metric Cards */}
              <MetricCards
                successRate={successRate}
                monthlyAchievement={monthlyAchievement}
                habitScore={habitScore}
                currentStreak={currentStreak}
                longestStreak={46}
                activeHabitsCount={filteredHabitsForMetrics.length}
                isDark={isDark}
                habits={filteredHabitsForMetrics}
                currentDay={currentDay}
              />

              {/* Progress Chart (Analytics) - Mobile View */}
              <div className="block lg:hidden w-full mb-3">
                <ProgressChart 
                  habits={selectedCategory === "all" ? habits : habits.filter((h) => h.category === selectedCategory)} 
                  currentMonth={currentMonth} 
                  currentYear={currentYear} 
                  currentDay={currentDay}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                  isDark={isDark}
                  selectedHabitId={selectedHabitId}
                  onSelectedHabitIdChange={setSelectedHabitId}
                  onSelectDay={setCurrentDay}
                />
              </div>

              {/* Mobile-Only Tab Switcher */}
              <div className="block lg:hidden w-full mb-1">
                <div className={`grid grid-cols-2 p-1 rounded-xl border transition-all ${
                  isDark ? "bg-slate-900 border-slate-800/80" : "bg-slate-100 border-slate-200/60"
                }`}>
                  <button
                    onClick={() => {
                      setMobileDashboardTab("reminders");
                      triggerToast("Switched to Upcoming Reminders");
                    }}
                    className={`py-2 text-[10.5px] font-black tracking-tight rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      mobileDashboardTab === "reminders"
                        ? isDark ? "bg-slate-800 text-blue-400 shadow-sm" : "bg-white text-[#2563EB] shadow-xs"
                        : isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-850"
                    }`}
                  >
                    <LucideIcon name="Bell" size={12} strokeWidth={2.5} />
                    <span>Reminders</span>
                  </button>
                  <button
                    onClick={() => {
                      setMobileDashboardTab("ledger");
                      triggerToast("Switched to Active Habits Ledger");
                    }}
                    className={`py-2 text-[10.5px] font-black tracking-tight rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      mobileDashboardTab === "ledger"
                        ? isDark ? "bg-slate-800 text-blue-400 shadow-sm" : "bg-white text-[#2563EB] shadow-xs"
                        : isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-850"
                    }`}
                  >
                    <LucideIcon name="CheckSquare" size={12} strokeWidth={2.5} />
                    <span>Ledger</span>
                  </button>
                </div>
              </div>

              {/* Middle Row: Progress Chart & Right Panel */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="hidden lg:block lg:col-span-8">
                  <ProgressChart 
                    habits={selectedCategory === "all" ? habits : habits.filter((h) => h.category === selectedCategory)} 
                    currentMonth={currentMonth} 
                    currentYear={currentYear} 
                    currentDay={currentDay}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    isDark={isDark}
                    selectedHabitId={selectedHabitId}
                    onSelectedHabitIdChange={setSelectedHabitId}
                    onSelectDay={setCurrentDay}
                  />
                </div>

                <div className={`lg:col-span-4 h-full ${mobileDashboardTab === "reminders" ? "block" : "hidden lg:block"}`}>
                  <RightPanels 
                    onOpenAICoach={() => setIsAICoachOpen(true)} 
                    isDark={isDark} 
                    habits={habits}
                    onToggleDay={handleToggleDay}
                    currentDay={currentDay}
                    currentMonth={currentMonth}
                  />
                </div>
              </div>

              {/* Bottom Section: Habit Tracker Table */}
              <div className={`pt-2 ${mobileDashboardTab === "ledger" ? "block" : "hidden lg:block"}`}>
                <HabitTrackerTable
                  habits={habits}
                  onToggleDay={handleToggleDay}
                  onLockAll={handleLockAll}
                  onTodayClick={handleTodayClick}
                  onSettingsClick={handleSettingsClick}
                  currentMonth={currentMonth}
                  currentYear={currentYear}
                  currentDay={currentDay}
                  onAddHabitClick={handleOpenAddHabit}
                  onEditHabitClick={handleOpenEditHabit}
                  viewMode={viewMode}
                  isDark={isDark}
                  onSelectDay={setCurrentDay}
                />
              </div>

            </div>
          ) : activeTab === "habits" ? (
            <div className="space-y-6 flex-1">
              
              {/* Header block with statistics and custom CTA */}
              <div className={`rounded-2xl p-6 text-white shadow-md relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                isDark ? "bg-slate-900 border border-slate-800" : "bg-gradient-to-r from-[#1E293B] to-[#0F172A]"
              }`}>
                <div className="relative z-10">
                  <span className="text-[10px] bg-blue-500/30 border border-blue-500/40 text-blue-300 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Routine Studio
                  </span>
                  <h3 className="text-base font-bold tracking-tight mt-1">Master Habits Ledger</h3>
                  <p className="text-slate-300 text-xs mt-1 leading-relaxed max-w-xl font-medium">
                    Analyze, configure, and refine your core actions. Create personalized micro-rewards and review individual streak rates.
                  </p>
                </div>

                <button
                  onClick={handleOpenAddHabit}
                  className="bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:from-[#1D4ED8] hover:to-[#6D28D9] text-white text-[10px] font-bold px-5 py-2.5 rounded-xl shadow-md transition-all hover:scale-102 active:scale-98 relative z-10 flex items-center gap-1.5 self-start sm:self-center shrink-0 cursor-pointer"
                >
                  <LucideIcon name="Plus" size={13} strokeWidth={2.5} />
                  <span>Create Custom Habit</span>
                </button>
              </div>

              {/* Grid of Habit Studio Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {habits.map((habit) => {
                  const completedDays = habit.days.filter(d => d === "completed").length;
                  const totalDays = habit.days.length;
                  const completionPercentage = Math.round((completedDays / totalDays) * 100);

                  return (
                    <div 
                      key={habit.id}
                      className={`rounded-2xl border p-5 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group relative overflow-hidden ${
                        isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div 
                          className="p-2.5 rounded-xl border flex items-center justify-center text-white shrink-0"
                          style={{ 
                            backgroundColor: `${habit.color}15`, 
                            color: habit.color, 
                            borderColor: `${habit.color}25` 
                          }}
                        >
                          <LucideIcon name={habit.iconName} size={18} strokeWidth={2.2} />
                        </div>

                        <div className="flex items-center gap-1.5">
                          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border shadow-xs font-mono text-[9px] font-extrabold ${
                            isDark ? "bg-amber-950/30 border-amber-900/60 text-amber-500" : "bg-amber-50 border-amber-100 text-amber-600"
                          }`}>
                            <LucideIcon name="Flame" size={11} className="animate-pulse" />
                            <span>{habit.streak}d</span>
                          </div>

                          <button
                            onClick={() => handleOpenEditHabit(habit)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isDark ? "hover:bg-slate-800 text-slate-400 hover:text-slate-200" : "hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                            }`}
                            title={`Configure ${habit.name}`}
                          >
                            <LucideIcon name="Settings" size={12} />
                          </button>
                        </div>
                      </div>

                      <div 
                        onClick={() => handleOpenEditHabit(habit)}
                        className="cursor-pointer hover:opacity-80 transition-opacity mt-2"
                      >
                        <h4 className={`font-bold text-xs tracking-tight truncate group-hover:text-blue-500 transition-colors ${
                          isDark ? "text-slate-100" : "text-[#0F172A]"
                        }`}>
                          {habit.name}
                        </h4>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mt-0.5">
                          Goal: {habit.goal}
                        </span>
                      </div>

                      <div className={`mt-4 pt-4 border-t ${isDark ? "border-slate-800" : "border-slate-100"}`}>
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1">
                          <span>Progress</span>
                          <span className={`font-mono ${isDark ? "text-slate-300" : "text-slate-700"}`}>{completionPercentage}%</span>
                        </div>
                        <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
                          <div 
                            className="h-full rounded-full transition-all duration-500 ease-out"
                            style={{ 
                              width: `${completionPercentage}%`,
                              backgroundColor: habit.color
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between mt-2.5 text-[9px] text-slate-400 font-semibold">
                          <span>Completions</span>
                          <span>{completedDays} / {totalDays} days</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpenEditHabit(habit)}
                        className={`mt-4 w-full py-2 border rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          isDark 
                            ? "bg-slate-800 border-slate-750 text-slate-200 hover:bg-slate-700" 
                            : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                        }`}
                      >
                        <LucideIcon name="Pencil" size={10} />
                        <span>Edit Configuration</span>
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2">
                <HabitTrackerTable
                  habits={habits}
                  onToggleDay={handleToggleDay}
                  onLockAll={handleLockAll}
                  onTodayClick={handleTodayClick}
                  onSettingsClick={handleSettingsClick}
                  currentMonth={currentMonth}
                  currentYear={currentYear}
                  currentDay={currentDay}
                  onAddHabitClick={handleOpenAddHabit}
                  onEditHabitClick={handleOpenEditHabit}
                  viewMode={viewMode}
                  isDark={isDark}
                  onSelectDay={setCurrentDay}
                />
              </div>

            </div>
          ) : activeTab === "performance" ? (
            <PerformanceView
              habits={habits}
              currentMonth={currentMonth}
              currentYear={currentYear}
              currentDay={currentDay}
              viewMode={viewMode}
              successRate={successRate}
              monthlyAchievement={monthlyAchievement}
              habitScore={habitScore}
              isDark={isDark}
              onReturn={() => setActiveTab("dashboard")}
            />
          ) : activeTab === "account" ? (
            <AccountView
              isDark={isDark}
              theme={theme}
              setTheme={setTheme}
              colorTheme={colorTheme}
              setColorTheme={setColorTheme}
              onReturn={() => setActiveTab("dashboard")}
              triggerToast={triggerToast}
            />
          ) : activeTab === "signout" ? (
            <SignOutView
              isDark={isDark}
              onSignIn={() => {
                setIsAuthModalOpen(true);
              }}
              triggerToast={triggerToast}
            />
          ) : (
            <div className={`flex-1 flex flex-col items-center justify-center text-center p-12 rounded-2xl border shadow-sm ${
              isDark ? "bg-slate-900 border-slate-800" : "bg-white border-[#E5E7EB]"
            }`}>
              <div className="p-4 rounded-full bg-blue-50 text-[#2563EB] mb-4 shadow-sm">
                <LucideIcon name="Layers" size={32} />
              </div>
              <h3 className={`font-bold text-base ${isDark ? "text-slate-100" : "text-[#0F172A]"}`}>Sabit Workspace Module</h3>
              <p className="text-[#64748B] text-xs font-semibold uppercase tracking-wider mt-1.5 max-w-sm leading-relaxed">
                You are currently viewing the {activeTab.toUpperCase()} section.
              </p>
              <button
                onClick={() => setActiveTab("dashboard")}
                className="mt-6 bg-gradient-to-r from-[#2563EB] to-[#7C3AED] text-white text-[10px] font-bold px-5 py-2.5 rounded-lg shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                Return to Dashboard
              </button>
            </div>
          )}

          <footer className={`text-center text-xs font-medium tracking-wide py-6 mt-12 select-none shrink-0 border-t flex flex-col items-center justify-center gap-1 ${
            isDark ? "text-slate-400 border-slate-800/60" : "text-slate-500 border-slate-200/80"
          }`}>
            <p className="font-bold text-sm tracking-tight flex items-center gap-1.5">
              <span>Gam<span className="text-blue-600">my</span></span>
              <span className="text-blue-600 font-normal">•</span>
              <span className={isDark ? "text-slate-300 font-medium" : "text-slate-600 font-medium"}>Your Personal AI Coach</span>
            </p>
            <p className="text-[11px] opacity-75">© 2026 Gammy. All rights reserved.</p>
          </footer>
        </main>

        {/* AI Coach Overlay Chat Side-Drawer */}
        <AICoachChat
          isOpen={isAICoachOpen}
          onClose={() => setIsAICoachOpen(false)}
          isDark={isDark}
          user={user}
        />

        {/* Floating AI Coach FAB Button */}
        <div id="sabit-ai-coach-fab" className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setIsAICoachOpen(!isAICoachOpen)}
            className="group relative flex items-center justify-center h-14 w-14 bg-gradient-to-tr from-[#2563EB] to-[#7C3AED] hover:from-[#1D4ED8] hover:to-[#6D28D9] text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer ring-4 ring-white"
            title="Toggle Sabit AI Success Coach"
          >
            <span className="absolute -inset-1 rounded-full bg-gradient-to-tr from-[#2563EB] to-[#7C3AED] opacity-40 blur-xs animate-pulse group-hover:scale-110 transition-all duration-300" />
            
            <div className="relative z-10">
              {isAICoachOpen ? (
                <LucideIcon name="X" size={24} strokeWidth={2.5} />
              ) : (
                <LucideIcon name="Bot" size={24} strokeWidth={2.5} />
              )}
            </div>

            {!isAICoachOpen && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[8px] font-extrabold text-white shadow-sm ring-2 ring-white">
                1
              </span>
            )}
          </button>
        </div>

        {/* Create/Edit Habit Modal */}
        <HabitModal
          isOpen={isHabitModalOpen}
          onClose={() => setIsHabitModalOpen(false)}
          onSave={handleSaveHabit}
          onDelete={handleDeleteHabit}
          habit={selectedHabitForEdit}
          isDark={isDark}
        />

        {/* Configuration settings modal */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          isDark={isDark}
          setIsDark={setIsDark}
          onResetProgress={handleResetProgress}
          onDeleteAllHabits={handleDeleteAllHabits}
        />

        {/* Firebase Authentication Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          isDark={isDark}
          onSuccess={(msg) => triggerToast(msg)}
        />

      </div>
    </div>
  );
}
