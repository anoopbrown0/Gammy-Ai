import { useState, useEffect, useRef } from "react";
import Header from "./components/Header";
import MetricCards from "./components/MetricCards";
import ProgressChart from "./components/ProgressChart";
import RightPanels from "./components/RightPanels";
import HabitTrackerTable from "./components/HabitTrackerTable";
import AICoachChat from "./components/AICoachChat";
import IOSBottomTabBar from "./components/IOSBottomTabBar";
import { initialHabits } from "./data";
import { Habit } from "./types";
import LucideIcon from "./components/LucideIcon";
import UserBanner from "./components/UserBanner";
import HabitModal from "./components/HabitModal";
import SettingsModal from "./components/SettingsModal";
import { AuthModal } from "./components/AuthModal";
import { LandingScreen } from "./components/LandingScreen";
import { PerformanceView, AccountView, SignOutView } from "./components/ExtraViews";
import { 
  onAuthChange, 
  logoutUser, 
  handleRedirectAuthResult,
  subscribeHabits, 
  subscribeHabitLogs, 
  fetchUserHabitsDirectly,
  fetchUserHabitLogsDirectly,
  addHabitToFirestore, 
  updateHabitInFirestore, 
  deleteHabitFromFirestore, 
  setHabitLogStatus,
  syncUserProfile,
  migrateGuestDataToUserIfNeeded
} from "./lib/firestoreService";
import { ensureAnonymousAuth } from "./lib/firebase";
import { 
  saveHabitToSupabase, 
  saveHabitLogToSupabase, 
  deleteHabitFromSupabase 
} from "./lib/supabaseService";
import { supabase } from "./supabaseClient";

// Storage key constants
const HABITS_MASTER_KEY = "sabit_habits_master";
const LOGS_MASTER_KEY = "sabit_all_logs_master";

const getDateStrForDay = (dayNum: number, monthName: string, yearStr: string) => {
  const months = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december"
  ];
  const monthIdx = months.indexOf(monthName.toLowerCase());
  const m = monthIdx >= 0 ? String(monthIdx + 1).padStart(2, "0") : "08";
  const d = String(dayNum).padStart(2, "0");
  return `${yearStr}-${m}-${d}`;
};

const isDateInFuture = (dayNum: number, monthName: string, yearStr: string): boolean => {
  const months = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december"
  ];
  const now = new Date();
  const mIdx = months.indexOf(monthName.toLowerCase());
  const targetYear = parseInt(yearStr, 10);
  const targetMonth = mIdx >= 0 ? mIdx : now.getMonth();
  
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const targetDate = new Date(targetYear, targetMonth, dayNum).getTime();
  return targetDate > todayStart;
};

export default function App() {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months[new Date().getMonth()] || "August";
  });
  const [currentYear, setCurrentYear] = useState(() => String(new Date().getFullYear()) || "2026");
  const [currentDay, setCurrentDay] = useState(() => new Date().getDate() || 14);
  const [activeTab, setActiveTab] = useState("dashboard");

  const [user, setUser] = useState<any | null>(null);
  const prevUserRef = useRef<any>(null);
  const [loginCelebration, setLoginCelebration] = useState<{
    active: boolean;
    title: string;
    subtitle: string;
  } | null>(null);

  const triggerLoginCelebration = (title = "Login Successful!", subtitle = "Welcome to Gammy. Loading your habit dashboard...") => {
    setLoginCelebration({ active: true, title, subtitle });
    setTimeout(() => {
      setLoginCelebration(null);
    }, 1800);
  };

  const [showLandingPage, setShowLandingPage] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("gammy_is_logged_out") === "true";
    }
    return false;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "signup" | "forgot" | "verify">("login");
  const [authModalUnverifiedEmail, setAuthModalUnverifiedEmail] = useState<string | undefined>(undefined);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Storage key based on Month and Year
  const habitsKey = `sabit_habits_${currentMonth}_${currentYear}`;

  // Synchronously initialize habits from local cache so screen is NEVER blank
  const [rawHabits, setRawHabits] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const lastUid = localStorage.getItem("sabit_last_uid");
        if (lastUid) {
          const userSaved = localStorage.getItem(`sabit_user_habits_${lastUid}`);
          if (userSaved) {
            const parsed = JSON.parse(userSaved);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
          }
        }
      } catch (_) {}
    }
    return initialHabits;
  });

  // Synchronously initialize logs from local cache so all past recordings appear immediately
  const [habitLogs, setHabitLogs] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const lastUid = localStorage.getItem("sabit_last_uid");
        if (lastUid) {
          const userLogs = localStorage.getItem(`sabit_user_logs_${lastUid}`);
          if (userLogs) {
            const parsed = JSON.parse(userLogs);
            if (Array.isArray(parsed)) return parsed;
          }
        }
      } catch (_) {}
    }
    return [];
  });

  const [habits, setHabits] = useState<Habit[]>([]);

  // 1. Listen for Authentication changes (Firebase Auth is authoritative)
  useEffect(() => {
    handleRedirectAuthResult().catch(err => console.error("Error checking redirect result:", err));

    const unsubscribeAuth = onAuthChange((currentUser) => {
      if (currentUser) {
        console.log("🔑 [App] Active Firebase User session:", currentUser.email || "Anonymous", "| UID:", currentUser.uid);
        
        // If transitioning from unauthenticated/anonymous or switching user accounts
        if (currentUser.email && (!prevUserRef.current || !prevUserRef.current.email)) {
          triggerLoginCelebration(
            "Logged in successfully", 
            currentUser.email || (currentUser.displayName ? `Welcome back, ${currentUser.displayName}!` : "Welcome back!")
          );
        }

        // If switching between different user IDs, load that specific user's cached data immediately
        if (currentUser.uid && (!prevUserRef.current || prevUserRef.current.uid !== currentUser.uid)) {
          try {
            localStorage.setItem("sabit_last_uid", currentUser.uid);
            const userSaved = localStorage.getItem(`sabit_user_habits_${currentUser.uid}`);
            if (userSaved) {
              const parsed = JSON.parse(userSaved);
              if (Array.isArray(parsed)) setRawHabits(parsed);
            } else {
              setRawHabits(initialHabits);
            }
            const userLogs = localStorage.getItem(`sabit_user_logs_${currentUser.uid}`);
            if (userLogs) {
              const parsedLogs = JSON.parse(userLogs);
              if (Array.isArray(parsedLogs)) setHabitLogs(parsedLogs);
            } else {
              setHabitLogs([]);
            }
          } catch (_) {}
        }

        prevUserRef.current = currentUser;
        setUser(currentUser);

        if (currentUser.email) {
          // If a registered user is authenticated, disable logged-out landing lock and navigate directly to dashboard
          localStorage.removeItem("gammy_is_logged_out");
          setShowLandingPage(false);
          setActiveTab("dashboard");
          setIsAuthModalOpen(false);
        }
        if (currentUser.displayName || currentUser.email) {
          const rawName = currentUser.displayName || (currentUser.email ? (
            (() => {
              const prefix = currentUser.email.split("@")[0];
              const clean = prefix.replace(/[0-9._-]+$/, "") || prefix;
              return clean.charAt(0).toUpperCase() + clean.slice(1);
            })()
          ) : "User");
          localStorage.setItem("sabit_profile_name", rawName);
          if (currentUser.email) {
            localStorage.setItem("sabit_profile_email", currentUser.email);
          }
          window.dispatchEvent(new CustomEvent("sabit_profile_changed", { detail: rawName }));
        }
      } else {
        prevUserRef.current = null;
        console.log("🔑 [App] Establishing secure Firestore session...");
        ensureAnonymousAuth().catch(e => console.warn("Anonymous auth notice:", e));
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  // 2. Real-time Firestore & Cloud Synchronization strictly per user UID
  useEffect(() => {
    if (!user || !user.uid) {
      return;
    }

    const currentUid = user.uid;
    let unsubHabits = () => {};
    let unsubLogs = () => {};

    (async () => {
      // 1. First ensure user's cloud records are initialized/seeded if new account
      try {
        await migrateGuestDataToUserIfNeeded(currentUid);
      } catch (err) {
        console.warn("Migration warning:", err);
      }

      // 2. Immediately fetch direct from cloud for instantaneous load
      try {
        const directHabits = await fetchUserHabitsDirectly(currentUid);
        if (Array.isArray(directHabits) && directHabits.length > 0) {
          setRawHabits(directHabits);
          try {
            localStorage.setItem(`sabit_user_habits_${currentUid}`, JSON.stringify(directHabits));
          } catch (_) {}
        }
      } catch (err) {
        console.warn("Direct habit load error:", err);
      }

      try {
        const directLogs = await fetchUserHabitLogsDirectly(currentUid);
        if (Array.isArray(directLogs)) {
          setHabitLogs(directLogs);
          try {
            localStorage.setItem(`sabit_user_logs_${currentUid}`, JSON.stringify(directLogs));
          } catch (_) {}
        }
      } catch (err) {
        console.warn("Direct logs load error:", err);
      }

      // 3. Establish live real-time listeners for updates
      unsubHabits = subscribeHabits(currentUid, async (cloudHabits) => {
        if (Array.isArray(cloudHabits) && cloudHabits.length > 0) {
          setRawHabits(cloudHabits);
          try {
            localStorage.setItem(`sabit_user_habits_${currentUid}`, JSON.stringify(cloudHabits));
          } catch (_) {}
        }
      });

      unsubLogs = subscribeHabitLogs(currentUid, (cloudLogs) => {
        if (Array.isArray(cloudLogs)) {
          setHabitLogs(cloudLogs);
          try {
            localStorage.setItem(`sabit_user_logs_${currentUid}`, JSON.stringify(cloudLogs));
          } catch (_) {}
        }
      });
    })();

    return () => {
      unsubHabits();
      unsubLogs();
    };
  }, [user?.uid]);

  // 3. Re-calculate habits + days array + streak whenever rawHabits, habitLogs, month, or year changes
  useEffect(() => {
    const months = [
      "january", "february", "march", "april", "may", "june",
      "july", "august", "september", "october", "november", "december"
    ];
    const monthIdx = months.indexOf(currentMonth.toLowerCase());
    const mPad = monthIdx >= 0 ? String(monthIdx + 1).padStart(2, "0") : "08";
    const monthPrefix = `${currentYear}-${mPad}`;

    const computedHabits: Habit[] = rawHabits.map((raw) => {
      const days: ("completed" | "skipped" | "locked")[] = Array(31).fill("locked");

      const logsForHabit = habitLogs.filter(
        (log) => log.habitId === raw.id && log.date && log.date.startsWith(monthPrefix)
      );

      logsForHabit.forEach((log) => {
        const parts = log.date.split("-");
        if (parts.length === 3) {
          const dayNum = parseInt(parts[2], 10);
          if (dayNum >= 1 && dayNum <= 31 && log.status) {
            days[dayNum - 1] = log.status as "completed" | "skipped" | "locked";
          }
        }
      });

      const streak = recalculateStreakAndDays(days);

      return {
        id: raw.id,
        name: raw.name,
        goal: raw.goal || "1x / day",
        color: raw.color || "#2563EB",
        iconName: raw.iconName || raw.icon || "Target",
        category: raw.category || "habit",
        active: raw.active !== false,
        days,
        streak
      };
    });

    setHabits(computedHabits);

    // Sync master copy to localStorage as cache
    if (typeof window !== "undefined") {
      const uid = user?.uid || "guest";
      try {
        localStorage.setItem(`sabit_user_habits_${uid}_${habitsKey}`, JSON.stringify(computedHabits));
      } catch (_) {}
    }
  }, [rawHabits, habitLogs, currentMonth, currentYear, user, habitsKey]);

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

  // Keep day in sync with today
  useEffect(() => {
    const updateDayOnly = () => {
      const today = new Date();
      setCurrentDay(today.getDate());
    };

    const interval = setInterval(updateDayOnly, 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("sabit_theme") as "light" | "dark") || "light";
    }
    return "light";
  });
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sabit_theme") === "dark";
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("sabit_theme", isDark ? "dark" : "light");
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

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
        triggerToast(next ? "⚡ BEAST MODE ACTIVATED! 100% focus locked!" : "Beast mode deactivated. Rest and recover.");
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

    const handleResetTrigger = () => {
      setIsResetConfirmModalOpen(true);
    };

    window.addEventListener("sabit_trigger_mantra", handleMantraTrigger);
    window.addEventListener("sabit_trigger_beast", handleBeastTrigger);
    window.addEventListener("sabit_trigger_toast", handleCustomToast);
    window.addEventListener("sabit_date_changed", handleDateChanged);
    window.addEventListener("sabit_reset_progress", handleResetTrigger);

    return () => {
      window.removeEventListener("sabit_trigger_mantra", handleMantraTrigger);
      window.removeEventListener("sabit_trigger_beast", handleBeastTrigger);
      window.removeEventListener("sabit_trigger_toast", handleCustomToast);
      window.removeEventListener("sabit_date_changed", handleDateChanged);
      window.removeEventListener("sabit_reset_progress", handleResetTrigger);
    };
  }, []);

  // Reset confirmation modal state
  const [isResetConfirmModalOpen, setIsResetConfirmModalOpen] = useState(false);

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
    setIsHabitModalOpen(false);
    const uid = user?.uid;

    if (selectedHabitForEdit) {
      // Edit Mode
      const editId = selectedHabitForEdit.id;
      if (uid) {
        updateHabitInFirestore(uid, editId, habitData).catch((err) => console.warn("Firestore habit update warning:", err));
        saveHabitToSupabase(uid, { id: editId, ...habitData }).catch((err) => console.warn("Supabase habit update warning:", err));
      }
      setRawHabits((prev) => {
        const next = prev.map((h) =>
          h.id === editId ? { ...h, ...habitData } : h
        );
        if (typeof window !== "undefined" && uid) {
          try {
            localStorage.setItem(`sabit_user_habits_${uid}`, JSON.stringify(next));
          } catch (_) {}
        }
        return next;
      });
      triggerToast(`Habit "${habitData.name}" updated successfully!`);
    } else {
      // Add Mode
      const newHabitId = "h_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
      const newHabitItem = {
        id: newHabitId,
        name: habitData.name,
        goal: habitData.goal || "1x / day",
        color: habitData.color || "#2563EB",
        iconName: habitData.iconName || "Target",
        category: habitData.category || "habit",
        active: habitData.active !== false,
      };

      // Instantly update state & local storage for immediate UI rendering
      setRawHabits((prev) => {
        const next = [...prev, newHabitItem];
        if (typeof window !== "undefined" && uid) {
          try {
            localStorage.setItem(`sabit_user_habits_${uid}`, JSON.stringify(next));
          } catch (_) {}
        }
        return next;
      });

      // Synchronize in background if user is authenticated
      if (uid) {
        addHabitToFirestore(uid, newHabitItem).catch((err) => console.warn("Firestore habit add warning:", err));
        saveHabitToSupabase(uid, newHabitItem).catch((err) => console.warn("Supabase habit add warning:", err));
      }

      triggerToast(`New habit "${habitData.name}" added to tracker!`);
    }
  };

  const handleDeleteHabit = async () => {
    if (selectedHabitForEdit) {
      const habitToDelete = selectedHabitForEdit;
      const uid = user?.uid;
      setIsHabitModalOpen(false);
      setSelectedHabitForEdit(null);

      if (uid) {
        deleteHabitFromFirestore(uid, habitToDelete.id).catch((err) => console.warn("Firestore delete warning:", err));
        deleteHabitFromSupabase(uid, habitToDelete.id).catch((err) => console.warn("Supabase delete warning:", err));
      }

      setRawHabits((prev) => {
        const next = prev.filter((h) => h.id !== habitToDelete.id);
        if (typeof window !== "undefined" && uid) {
          try {
            localStorage.setItem(`sabit_user_habits_${uid}`, JSON.stringify(next));
          } catch (_) {}
        }
        return next;
      });

      triggerToast(`Habit "${habitToDelete.name}" has been removed.`);
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
    if (isDateInFuture(dayNum, currentMonth, currentYear)) {
      triggerToast(`Future days (${currentMonth} ${dayNum}, ${currentYear}) are locked and cannot be logged yet.`);
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

    // Save to LocalStorage strictly scoped to current UID
    const uid = user?.uid;
    if (uid) {
      try {
        localStorage.setItem(`sabit_user_habits_${uid}_${habitsKey}`, JSON.stringify(updatedHabits));
        localStorage.setItem(`sabit_user_habits_${uid}`, JSON.stringify(rawHabits));
      } catch (e) {
        console.warn("LocalStorage write notice:", e);
      }
    }

    // Save log entry to local log list cache & update habitLogs state
    const dateStr = getDateStrForDay(dayNum, currentMonth, currentYear);
    const docId = `${habitId}_${dateStr}`;
    const logObj = {
      id: docId,
      habitId,
      date: dateStr,
      status: nextStatus === "locked" ? null : nextStatus
    };

    setHabitLogs((prevLogs) => {
      const filtered = prevLogs.filter((l) => !(l.habitId === habitId && l.date === dateStr));
      if (nextStatus !== "locked") {
        filtered.push(logObj);
      }
      if (uid) {
        try {
          localStorage.setItem(`sabit_user_logs_${uid}`, JSON.stringify(filtered));
        } catch (_) {}
      }
      return filtered;
    });

    // Save to Firestore and Supabase if user is authenticated
    if (user && user.uid) {
      await setHabitLogStatus(
        user.uid,
        habitId,
        dateStr,
        nextStatus === "locked" ? null : nextStatus
      );
      await saveHabitLogToSupabase(
        user.uid,
        habitId,
        dateStr,
        nextStatus === "locked" ? null : nextStatus
      );
    }

    triggerToast(nextStatus === "completed" ? "Habit marked completed! 🔥" : nextStatus === "skipped" ? "Habit marked skipped" : "Habit tick cleared");
  };

  // Clear All Ticks - resets ticks for current day
  const handleLockAll = async () => {
    const dateStr = getDateStrForDay(currentDay, currentMonth, currentYear);
    
    // Clear logs for the current day
    setHabitLogs((prev) => {
      const filtered = prev.filter((l) => l.date !== dateStr);
      try {
        const uid = user?.uid || "guest";
        localStorage.setItem(LOGS_MASTER_KEY, JSON.stringify(filtered));
        localStorage.setItem(`sabit_user_logs_${uid}`, JSON.stringify(filtered));
      } catch (_) {}
      return filtered;
    });

    if (user && user.uid) {
      for (const h of habits) {
        await setHabitLogStatus(user.uid, h.id, dateStr, null);
      }
    }
    triggerToast("Today's ticks cleared!");
  };

  const handleTodayClick = () => {
    const today = new Date();
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const m = months[today.getMonth()] || "August";
    const y = String(today.getFullYear()) || "2026";
    const d = today.getDate() || 18;
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
    setIsResetConfirmModalOpen(true);
  };

  const handleConfirmResetAllHabits = async () => {
    setIsResetConfirmModalOpen(false);
    const uid = user?.uid;
    if (uid) {
      for (const h of rawHabits) {
        await deleteHabitFromFirestore(uid, h.id).catch(() => {});
        await deleteHabitFromSupabase(uid, h.id).catch(() => {});
      }
    }
    setRawHabits([]);
    setHabitLogs([]);
    setHabits([]);
    if (typeof window !== "undefined") {
      const userKey = uid || "guest";
      try {
        localStorage.setItem(HABITS_MASTER_KEY, JSON.stringify([]));
        localStorage.setItem(LOGS_MASTER_KEY, JSON.stringify([]));
        localStorage.setItem(`sabit_user_habits_${userKey}`, JSON.stringify([]));
        localStorage.setItem(`sabit_user_logs_${userKey}`, JSON.stringify([]));
        localStorage.setItem(`sabit_user_habits_${userKey}_${habitsKey}`, JSON.stringify([]));
      } catch (_) {}
    }
    triggerToast("All habits reset! Start fresh by adding your first habit.");
  };

  const handleDeleteAllHabits = async () => {
    handleResetProgress();
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

  // Logout handler that resets session and redirects to the Gammy landing home page
  const handleSignOut = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.warn("Logout error:", e);
    }
    prevUserRef.current = null;
    setUser(null);
    setRawHabits(initialHabits);
    setHabitLogs([]);
    setHabits([]);
    localStorage.removeItem("sabit_last_uid");
    localStorage.setItem("gammy_is_logged_out", "true");
    setShowLandingPage(true);
    setActiveTab("dashboard");
    setIsAuthModalOpen(false);
    triggerToast("Logged out successfully.");
  };

  // Authentication check - Only users with verified email/login can view the main tracker
  const isUserLoggedIn = Boolean(user && user.email);

  if (!isUserLoggedIn || showLandingPage) {
    return (
      <div className={`min-h-screen font-sans antialiased relative ${
        isDark ? "bg-[#0B0F17] text-slate-100" : "bg-[#F8FAFC] text-slate-900"
      }`}>
        {/* Floating Interactive Toast */}
        {toastMessage && (
          <div className={`fixed top-6 left-1/2 -translate-x-1/2 text-xs font-bold py-2.5 px-4 rounded-xl shadow-xl backdrop-blur-md flex items-center gap-2 z-50 border animate-slide-down ${
            isDark ? "bg-slate-900/90 text-white border-slate-800" : "bg-white/90 text-slate-900 border-slate-200"
          }`}>
            <LucideIcon name="Sparkles" size={13} className="text-blue-500" />
            <span>{toastMessage}</span>
          </div>
        )}

        <LandingScreen
          onOpenAuth={(mode) => {
            setAuthModalMode(mode);
            setIsAuthModalOpen(true);
          }}
          isDark={isDark}
          setIsDark={setIsDark}
        />

        {/* Authentication Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => {
            setIsAuthModalOpen(false);
            setAuthModalUnverifiedEmail(undefined);
          }}
          isDark={isDark}
          onSuccess={(msg) => {
            triggerLoginCelebration("Logged in successfully", user?.email || msg || "Welcome to Gammy!");
            triggerToast(msg);
            setShowLandingPage(false);
            setActiveTab("dashboard");
            localStorage.removeItem("gammy_is_logged_out");
            setIsAuthModalOpen(false);
          }}
          initialMode={authModalMode}
          initialUnverifiedEmail={authModalUnverifiedEmail}
        />
      </div>
    );
  }

  if (isAuthLoading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors ${
        isDark ? "bg-[#000000] text-slate-100" : "bg-[#F2F2F7] text-[#1C1C1E]"
      }`}>
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 animate-pulse">
            <LucideIcon name="Target" size={20} />
          </div>
          <p className="text-xs font-medium text-slate-500">Syncing Gammy ledger...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`min-h-screen font-sans antialiased transition-colors duration-300 relative ${
        isDark ? "bg-[#000000] text-slate-100" : "bg-[#F2F2F7] text-[#1C1C1E]"
      }`}
    >
      {/* Simple White Screen Login Success Card over Blurred Dashboard */}
      {loginCelebration?.active && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-md animate-fadeIn">
          <div className="flex flex-col items-center justify-center text-center max-w-sm w-full p-8 sm:p-9 rounded-3xl bg-white text-slate-900 shadow-2xl shadow-slate-900/20 border border-slate-100 ring-1 ring-slate-900/5 animate-scale-success">
            {/* Simple Animated Green Right-Tick Circle */}
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 ring-8 ring-emerald-50/70 flex items-center justify-center mb-5 shadow-xs">
              <svg 
                className="w-8 h-8 text-emerald-600" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="3.2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <polyline 
                  points="20 6 9 17 4 12" 
                  className="animate-checkmark-draw" 
                />
              </svg>
            </div>

            {/* Simple Clean Typography */}
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              {loginCelebration.title || "Logged in successfully"}
            </h2>
            
            <p className="mt-1.5 text-xs text-slate-500 font-medium truncate max-w-xs">
              {loginCelebration.subtitle || user?.email || "Welcome back to your dashboard"}
            </p>

            {/* Simple Loading Indicator */}
            <div className="mt-6 flex items-center gap-2 text-[11px] font-semibold text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Opening your habit dashboard...</span>
            </div>
          </div>
        </div>
      )}

      <div className={`min-h-screen max-w-[1600px] mx-auto transition-all duration-300 relative ${
        loginCelebration?.active ? "filter blur-sm scale-[0.995] pointer-events-none select-none" : "filter-none"
      } ${
        isBeastMode ? "ring-4 ring-rose-500/80 shadow-[0_0_50px_rgba(244,63,94,0.4)]" : ""
      } ${
        isDark ? "bg-[#000000]" : "bg-[#F2F2F7]"
      }`}>
        {/* Floating Interactive Toast */}
        {toastMessage && (
          <div className={`fixed top-6 left-1/2 -translate-x-1/2 text-xs font-bold py-3 px-5 rounded-full shadow-2xl backdrop-blur-xl flex items-center gap-2.5 z-50 border animate-slide-down ${
            isDark ? "bg-[#1C1C1E]/90 text-white border-white/10" : "bg-white/90 text-slate-900 border-slate-200/80"
          }`}>
            <LucideIcon name="Sparkles" size={13} className="text-[#007AFF] animate-spin-slow" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Master Workspace Content Area - Full Width */}
        <main className={`flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-3.5 sm:py-5 pb-28 sm:pb-32 flex flex-col min-h-screen transition-colors duration-300 relative ${
          isDark ? "bg-[#000000]" : "bg-[#F2F2F7]"
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
            onOpenAuthModal={() => {
              setAuthModalMode("login");
              setIsAuthModalOpen(true);
            }}
            onSignOut={handleSignOut}
            onGoToLanding={() => setShowLandingPage(true)}
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
                    <LucideIcon name="Clock" size={12} strokeWidth={2.5} />
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
                {habits.map((habit, habitIndex) => {
                  const completedDays = habit.days.filter(d => d === "completed").length;
                  const totalDays = habit.days.length;
                  const completionPercentage = Math.round((completedDays / totalDays) * 100);

                  return (
                    <div 
                      key={habit.id ? `studio-${habit.id}-${habitIndex}` : `studio-${habitIndex}`}
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
                            <LucideIcon name="Zap" size={11} className="animate-pulse" />
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
              setIsDark={setIsDark}
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
                setAuthModalMode("login");
                setIsAuthModalOpen(true);
              }}
              onGoToLanding={() => setShowLandingPage(true)}
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
          onClose={() => {
            setIsAuthModalOpen(false);
            setAuthModalUnverifiedEmail(undefined);
          }}
          isDark={isDark}
          onSuccess={(msg) => {
            triggerLoginCelebration("Logged in successfully", user?.email || msg || "Welcome to Gammy!");
            triggerToast(msg);
            setIsAuthModalOpen(false);
          }}
          initialMode={authModalMode}
          initialUnverifiedEmail={authModalUnverifiedEmail}
        />

        {/* Floating iOS Bottom Navigation Bar */}
        <IOSBottomTabBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isDark={isDark}
          onOpenAddHabit={handleOpenAddHabit}
        />

        {/* Reset All Habits Confirmation Modal */}
        {isResetConfirmModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className={`w-full max-w-sm p-6 rounded-3xl border shadow-2xl transition-all ${
              isDark ? "bg-[#1C1C1E] border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
            }`}>
              <div className="flex items-center gap-3.5 mb-3.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center shrink-0">
                  <LucideIcon name="AlertTriangle" size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold tracking-tight">Reset All Habits?</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Start fresh with an empty ledger</p>
                </div>
              </div>

              <p className={`text-xs leading-relaxed mb-6 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                Are you sure you want to reset all habits? This will remove all your current habits and checkmarks so you can start from the beginning by creating your own custom habits.
              </p>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsResetConfirmModalOpen(false)}
                  className={`py-2.5 px-4 text-xs font-semibold rounded-xl border transition-all cursor-pointer text-center ${
                    isDark ? "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10" : "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmResetAllHabits}
                  className="py-2.5 px-4 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LucideIcon name="RotateCcw" size={13} />
                  <span>Reset All</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
