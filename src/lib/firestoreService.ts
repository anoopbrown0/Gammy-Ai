import { 
  getAuth, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  User as FirebaseUser
} from "firebase/auth";
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  onSnapshot, 
  deleteDoc, 
  updateDoc,
  query,
  where,
  orderBy
} from "firebase/firestore";
import { auth, db, handleFirestoreError, OperationType, isFirebaseEnabled } from "./firebase";
import { Habit, UserProfile, HabitLogDoc, GoalDoc, ReminderDoc, AIInsightDoc, WeeklyReportDoc, ChatMessage } from "../types";
import { initialHabits } from "../data";
import { 
  saveHabitToSupabase, 
  saveHabitLogToSupabase, 
  deleteHabitFromSupabase,
  fetchHabitsFromSupabase,
  fetchHabitLogsFromSupabase
} from "./supabaseService";
import { supabase } from "../supabaseClient";

// Helper to format Auth / Firestore errors into user-friendly messages
export function formatAuthOrFirestoreError(err: any): string {
  if (!err) return "An unexpected error occurred.";
  
  let rawMsg = err.message || String(err);
  
  // Parse JSON error payload if present
  if (typeof rawMsg === "string" && rawMsg.trim().startsWith("{") && rawMsg.trim().endsWith("}")) {
    try {
      const parsed = JSON.parse(rawMsg);
      if (parsed.error) rawMsg = parsed.error;
    } catch (_) {}
  }

  if (rawMsg.includes("auth/popup-blocked")) {
    return "Sign-in popup was blocked by your browser. Please allow popups or use Email sign-in.";
  }
  if (rawMsg.includes("auth/unauthorized-domain")) {
    return "This domain is authenticating. Please click 'Continue with Google' or use Email sign-in.";
  }
  if (rawMsg.includes("auth/popup-closed-by-user")) {
    return "Google sign-in window was closed before completing.";
  }
  if (rawMsg.includes("auth/cancelled-popup-request")) {
    return "Sign-in request was cancelled.";
  }
  if (rawMsg.includes("auth/operation-not-allowed")) {
    return "Please click 'Continue with Google' to sign in with your Google account.";
  }
  if (
    rawMsg.includes("auth/invalid-credential") || 
    rawMsg.includes("auth/wrong-password") || 
    rawMsg.includes("auth/user-not-found") ||
    rawMsg.includes("auth/invalid-email")
  ) {
    return "Email or password is incorrect";
  }
  if (rawMsg.includes("auth/email-already-in-use")) {
    return "User already exists. Please sign in";
  }
  if (rawMsg.includes("auth/weak-password")) {
    return "Password should be at least 6 characters long.";
  }
  if (rawMsg.includes("auth/network-request-failed")) {
    return "Network error connecting to Firebase. Please check your internet connection.";
  }
  if (rawMsg.includes("permission-denied") || rawMsg.includes("Missing or insufficient permissions")) {
    return "Access permission denied. Please verify you are signed in.";
  }

  if (rawMsg.includes("Firebase:")) {
    return rawMsg.replace(/^Firebase:\s*/i, "").replace(/Error\s*\(([^)]+)\)\.?/i, "($1)");
  }

  return rawMsg;
}

// ==================== AUTHENTICATION SERVICES ====================

export async function registerUserWithEmail(email: string, pass: string, name?: string) {
  const cleanEmail = email.trim().toLowerCase();
  const displayName = name?.trim() || (cleanEmail.split("@")[0].charAt(0).toUpperCase() + cleanEmail.split("@")[0].slice(1));
  const safeUid = `user_${btoa(cleanEmail).replace(/[^a-zA-Z0-9]/g, '_')}`;

  if (!auth) {
    const userObj = {
      uid: safeUid,
      email: cleanEmail,
      displayName,
      photoURL: null,
      emailVerified: true
    };
    localStorage.setItem("sabit_mock_user", JSON.stringify(userObj));
    localStorage.setItem("sabit_last_uid", safeUid);
    localStorage.setItem("sabit_profile_name", displayName);
    localStorage.setItem("sabit_profile_email", cleanEmail);
    return userObj as any;
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
    if (displayName && cred.user) {
      try {
        await updateProfile(cred.user, { displayName });
      } catch (_) {}
    }
    if (cred.user) {
      console.log("🔑 [Firebase Auth] User registered successfully:", {
        email: cred.user.email,
        uid: cred.user.uid
      });
      localStorage.setItem("sabit_last_uid", cred.user.uid);
      localStorage.setItem("sabit_profile_name", displayName);
      localStorage.setItem("sabit_profile_email", cleanEmail);
      await syncUserProfile(cred.user, { name: displayName });
    }
    return cred.user;
  } catch (error: any) {
    console.warn("Firebase email signup response/error:", error);
    const code = error?.code || "";
    const msg = error?.message || "";

    if (code === "auth/email-already-in-use" || msg.includes("email-already-in-use")) {
      throw new Error("User already exists. Please sign in");
    }

    // If email/password provider is disabled in Firebase console, fallback to seamless email session
    if (
      code === "auth/operation-not-allowed" ||
      code === "auth/admin-restricted-operation" ||
      code === "auth/configuration-not-found" ||
      msg.includes("operation-not-allowed") ||
      msg.includes("CONFIGURATION_NOT_FOUND")
    ) {
      const userObj: any = {
        uid: safeUid,
        email: cleanEmail,
        displayName,
        photoURL: null,
        emailVerified: true
      };
      localStorage.setItem("sabit_mock_user", JSON.stringify(userObj));
      localStorage.setItem("sabit_last_uid", safeUid);
      localStorage.setItem("sabit_profile_name", displayName);
      localStorage.setItem("sabit_profile_email", cleanEmail);
      await syncUserProfile(userObj, { name: displayName });
      return userObj;
    }

    throw new Error(formatAuthOrFirestoreError(error));
  }
}

export async function loginUserWithEmail(email: string, pass: string) {
  const cleanEmail = email.trim().toLowerCase();
  const safeUid = `user_${btoa(cleanEmail).replace(/[^a-zA-Z0-9]/g, '_')}`;
  const displayName = cleanEmail.split("@")[0].charAt(0).toUpperCase() + cleanEmail.split("@")[0].slice(1);

  if (!auth) {
    const userObj = {
      uid: safeUid,
      email: cleanEmail,
      displayName,
      photoURL: null,
      emailVerified: true
    };
    localStorage.setItem("sabit_mock_user", JSON.stringify(userObj));
    localStorage.setItem("sabit_last_uid", safeUid);
    localStorage.setItem("sabit_profile_name", displayName);
    localStorage.setItem("sabit_profile_email", cleanEmail);
    return userObj as any;
  }

  try {
    const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
    if (cred.user) {
      console.log("🔑 [Firebase Auth] User logged in via Email:", {
        email: cred.user.email,
        uid: cred.user.uid
      });
      localStorage.setItem("sabit_last_uid", cred.user.uid);
      localStorage.setItem("sabit_profile_name", cred.user.displayName || displayName);
      localStorage.setItem("sabit_profile_email", cleanEmail);
      await syncUserProfile(cred.user);
    }
    return cred.user;
  } catch (error: any) {
    console.warn("Firebase email signin response/error:", error);
    const code = error?.code || "";
    const msg = error?.message || "";

    if (
      code === "auth/invalid-credential" ||
      code === "auth/wrong-password" ||
      code === "auth/user-not-found" ||
      code === "auth/invalid-email" ||
      msg.includes("invalid-credential") ||
      msg.includes("wrong-password") ||
      msg.includes("user-not-found") ||
      msg.includes("invalid-email")
    ) {
      throw new Error("Email or password is incorrect");
    }

    // If email/password provider is disabled in Firebase console, fallback to seamless email session
    if (
      code === "auth/operation-not-allowed" ||
      code === "auth/admin-restricted-operation" ||
      code === "auth/configuration-not-found" ||
      msg.includes("operation-not-allowed") ||
      msg.includes("CONFIGURATION_NOT_FOUND")
    ) {
      const userObj: any = {
        uid: safeUid,
        email: cleanEmail,
        displayName,
        photoURL: null,
        emailVerified: true
      };
      localStorage.setItem("sabit_mock_user", JSON.stringify(userObj));
      localStorage.setItem("sabit_last_uid", safeUid);
      localStorage.setItem("sabit_profile_name", displayName);
      localStorage.setItem("sabit_profile_email", cleanEmail);
      await syncUserProfile(userObj);
      return userObj;
    }

    throw new Error(formatAuthOrFirestoreError(error));
  }
}

export async function handleRedirectAuthResult() {
  if (!isFirebaseEnabled || !auth) return null;
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      console.log("🔑 [Firebase Auth] Redirect sign-in success:", {
        email: result.user.email,
        uid: result.user.uid
      });
      localStorage.setItem("sabit_last_uid", result.user.uid);
      if (result.user.email) localStorage.setItem("sabit_profile_email", result.user.email);
      if (result.user.displayName) localStorage.setItem("sabit_profile_name", result.user.displayName);
      await syncUserProfile(result.user);
      return result.user;
    }
  } catch (error) {
    console.error("Error handling redirect auth result:", error);
  }
  return null;
}

export async function loginWithGoogle() {
  if (!isFirebaseEnabled || !auth) {
    const defaultEmail = localStorage.getItem("sabit_profile_email") || "anoopbrown0@gmail.com";
    const defaultName = localStorage.getItem("sabit_profile_name") || "Anoop Brown";
    const safeUid = `user_${btoa(defaultEmail.toLowerCase()).replace(/[^a-zA-Z0-9]/g, '_')}`;
    const userObj = {
      uid: safeUid,
      displayName: defaultName,
      email: defaultEmail,
      photoURL: null,
      emailVerified: true,
      isAnonymous: false
    };
    localStorage.setItem("sabit_mock_user", JSON.stringify(userObj));
    localStorage.setItem("sabit_last_uid", safeUid);
    return userObj as any;
  }

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  try {
    const result = await signInWithPopup(auth, provider);
    if (result && result.user) {
      console.log("🔑 [Firebase Auth] Google sign-in success:", {
        email: result.user.email,
        uid: result.user.uid
      });
      localStorage.setItem("sabit_last_uid", result.user.uid);
      if (result.user.email) localStorage.setItem("sabit_profile_email", result.user.email);
      if (result.user.displayName) localStorage.setItem("sabit_profile_name", result.user.displayName);
      await syncUserProfile(result.user);
      return result.user;
    }
    return null;
  } catch (error: any) {
    console.error("Error signing in with Google:", error);
    throw new Error(formatAuthOrFirestoreError(error));
  }
}

export async function logoutUser() {
  localStorage.removeItem("sabit_mock_user");
  localStorage.removeItem("sabit_last_uid");
  localStorage.setItem("gammy_is_logged_out", "true");
  if (auth && isFirebaseEnabled) {
    try {
      await firebaseSignOut(auth);
    } catch (_) {}
  } else if (auth && (auth as any).signOut) {
    try {
      await (auth as any).signOut();
    } catch (_) {}
  }
}

export async function sendPasswordReset(email: string) {
  if (!isFirebaseEnabled || !auth) {
    return;
  }
  try {
    return await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    throw new Error(formatAuthOrFirestoreError(error));
  }
}

export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  if (isFirebaseEnabled && auth) {
    return onAuthStateChanged(auth, (user) => {
      if (user && !user.isAnonymous) {
        console.log("🔑 [Firebase Auth State] User authenticated:", {
          email: user.email,
          uid: user.uid
        });
        callback(user);
      } else {
        const storedMock = localStorage.getItem("sabit_mock_user");
        if (storedMock) {
          try {
            const parsed = JSON.parse(storedMock);
            if (parsed && parsed.email) {
              console.log("🔑 [Session State] User authenticated via email session:", parsed.email);
              callback(parsed);
              return;
            }
          } catch (_) {}
        }
        callback(user);
      }
    });
  } else if (auth && (auth as any).onAuthStateChanged) {
    return (auth as any).onAuthStateChanged(callback);
  }
  return () => {};
}

// ==================== USER PROFILE SERVICES ====================

export async function syncUserProfile(user: FirebaseUser, extra: Partial<UserProfile> = {}) {
  if (!user || !user.uid || !isFirebaseEnabled || !db) return;
  const userRef = doc(db, "users", user.uid);
  const now = new Date().toISOString();
  try {
    const snap = await getDoc(userRef);
    const existing = snap.data() || {};
    const profile: UserProfile = {
      id: user.uid,
      name: extra.name || user.displayName || existing.name || "User",
      email: user.email || existing.email || "",
      photoURL: user.photoURL || existing.photoURL || "",
      plan: existing.plan || "Free Tier",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      createdAt: existing.createdAt || now,
      updatedAt: now
    };
    await setDoc(userRef, profile, { merge: true });
    return profile;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!userId || !isFirebaseEnabled || !db) return null;
  const path = `users/${userId}`;
  try {
    const snap = await getDoc(doc(db, "users", userId));
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

// ==================== HABITS SERVICES ====================

export async function migrateGuestDataToUserIfNeeded(userId: string) {
  if (!userId || !isFirebaseEnabled || !db) return;
  const migrationKey = `sabit_seeded_${userId}`;
  if (localStorage.getItem(migrationKey) === "true") return;

  try {
    // Check if Firestore user already has habits
    const habitsCol = collection(db, "users", userId, "habits");
    const snap = await getDocs(habitsCol);
    if (!snap.empty) {
      localStorage.setItem(migrationKey, "true");
      return;
    }

    // New user with no habits in cloud: seed with default clean template
    const habitsToSeed = initialHabits;

    for (const habit of habitsToSeed) {
      const habitId = habit.id || `h_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const now = new Date().toISOString();
      await setDoc(doc(db, "users", userId, "habits", habitId), {
        id: habitId,
        name: habit.name || "Untitled Habit",
        icon: habit.iconName || "Target",
        iconName: habit.iconName || "Target",
        color: habit.color || "#2563EB",
        category: habit.category || "habit",
        goal: habit.goal || "1x / day",
        frequency: habit.frequency || "daily",
        reminderTime: habit.reminderTime || "09:00",
        active: habit.active !== false,
        createdAt: now,
        updatedAt: now
      });
    }

    localStorage.setItem(migrationKey, "true");
  } catch (e) {
    console.warn("User seeding warning:", e);
  }
}

export function subscribeHabits(userId: string, callback: (habits: any[]) => void) {
  if (!userId || !isFirebaseEnabled || !db) {
    return () => {};
  }
  const habitsCol = collection(db, "users", userId, "habits");
  
  // Immediate direct fetch for instant response on cross-device login
  getDocs(habitsCol).then((snapshot) => {
    if (!snapshot.empty) {
      const habits = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          iconName: data.iconName || data.icon || "Target",
          color: data.color || "#2563EB",
          active: data.active !== false
        };
      });
      callback(habits);
    }
  }).catch(err => console.warn("Direct habits fetch notice:", err));

  return onSnapshot(
    habitsCol,
    (snapshot) => {
      const habits = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          iconName: data.iconName || data.icon || "Target",
          color: data.color || "#2563EB",
          active: data.active !== false
        };
      });
      if (habits.length > 0) {
        callback(habits);
      }
    },
    (error) => {
      console.warn("Habits snapshot listener warning (using cloud fallback):", error);
      fetchUserHabitsDirectly(userId).then(habits => {
        if (habits.length > 0) callback(habits);
      });
    }
  );
}

export async function fetchUserHabitsDirectly(userId: string): Promise<any[]> {
  if (!userId) return [];
  const habitsList: any[] = [];

  // Try Firestore
  if (isFirebaseEnabled && db) {
    try {
      const habitsCol = collection(db, "users", userId, "habits");
      const snap = await getDocs(habitsCol);
      if (!snap.empty) {
        snap.docs.forEach((d) => {
          const data = d.data();
          habitsList.push({
            id: d.id,
            ...data,
            iconName: data.iconName || data.icon || "Target",
            color: data.color || "#2563EB",
            active: data.active !== false
          });
        });
        if (habitsList.length > 0) return habitsList;
      }
    } catch (e) {
      console.warn("Firestore fetch habits direct notice:", e);
    }
  }

  // Try Supabase fallback
  try {
    const supaData = await fetchHabitsFromSupabase(userId);
    if (Array.isArray(supaData) && supaData.length > 0) {
      return supaData.map((d: any) => ({
        id: d.id,
        name: d.name,
        goal: d.goal || "1x / day",
        color: d.color || "#2563EB",
        iconName: d.icon || "Target",
        category: d.category || "habit",
        active: d.active !== false
      }));
    }
  } catch (e) {
    console.warn("Supabase fetch habits fallback notice:", e);
  }

  return habitsList;
}

export async function fetchUserHabitLogsDirectly(userId: string): Promise<HabitLogDoc[]> {
  if (!userId) return [];
  const logsList: HabitLogDoc[] = [];

  // Try Firestore
  if (isFirebaseEnabled && db) {
    try {
      const logsCol = collection(db, "users", userId, "habitLogs");
      const snap = await getDocs(logsCol);
      if (!snap.empty) {
        snap.docs.forEach((d) => {
          logsList.push({
            id: d.id,
            ...d.data()
          } as HabitLogDoc);
        });
        if (logsList.length > 0) return logsList;
      }
    } catch (e) {
      console.warn("Firestore fetch logs direct notice:", e);
    }
  }

  // Try Supabase fallback
  try {
    const supaLogs = await fetchHabitLogsFromSupabase(userId);
    if (Array.isArray(supaLogs) && supaLogs.length > 0) {
      return supaLogs.map((l: any) => ({
        id: l.id || `${l.habit_id}_${l.date_str}`,
        habitId: l.habit_id,
        date: l.date_str,
        status: l.status,
        completedAt: l.updated_at
      })) as HabitLogDoc[];
    }
  } catch (e) {
    console.warn("Supabase fetch logs fallback notice:", e);
  }

  return logsList;
}

export async function addHabitToFirestore(userId: string, habitData: any) {
  if (!userId) return null;
  const habitId = habitData.id || `h_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const path = `users/${userId}/habits/${habitId}`;
  const now = new Date().toISOString();
  
  const payload = {
    id: habitId,
    name: habitData.name,
    icon: habitData.iconName || habitData.icon || "Target",
    iconName: habitData.iconName || habitData.icon || "Target",
    color: habitData.color || "#2563EB",
    category: habitData.category || "habit",
    goal: habitData.goal || "1x / day",
    frequency: habitData.frequency || "daily",
    reminderTime: habitData.reminderTime || "09:00",
    active: habitData.active !== false,
    createdAt: now,
    updatedAt: now
  };

  // Sync to Supabase
  try {
    await saveHabitToSupabase(userId, payload);
  } catch (e) {
    console.warn("Supabase habit sync warning:", e);
  }

  if (!isFirebaseEnabled || !db) return habitId;

  try {
    await setDoc(doc(db, "users", userId, "habits", habitId), payload);
    return habitId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return habitId;
  }
}

export async function updateHabitInFirestore(userId: string, habitId: string, habitData: Partial<Habit>) {
  if (!userId || !habitId) return;
  const path = `users/${userId}/habits/${habitId}`;
  const now = new Date().toISOString();

  // Sync to Supabase
  try {
    await saveHabitToSupabase(userId, { id: habitId, ...habitData });
  } catch (e) {
    console.warn("Supabase update habit sync warning:", e);
  }

  if (!isFirebaseEnabled || !db) return;
  const habitRef = doc(db, "users", userId, "habits", habitId);

  const updatePayload: Record<string, any> = {
    updatedAt: now
  };
  if (habitData.name !== undefined) updatePayload.name = habitData.name;
  if (habitData.iconName !== undefined) updatePayload.icon = habitData.iconName;
  if (habitData.color !== undefined) updatePayload.color = habitData.color;
  if (habitData.category !== undefined) updatePayload.category = habitData.category;
  if (habitData.goal !== undefined) updatePayload.goal = habitData.goal;
  if (habitData.frequency !== undefined) updatePayload.frequency = habitData.frequency;
  if (habitData.reminderTime !== undefined) updatePayload.reminderTime = habitData.reminderTime;
  if (habitData.active !== undefined) updatePayload.active = habitData.active;

  try {
    await setDoc(habitRef, updatePayload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function togglePauseHabitInFirestore(userId: string, habitId: string, active: boolean) {
  return updateHabitInFirestore(userId, habitId, { active });
}

export async function deleteHabitFromFirestore(userId: string, habitId: string) {
  if (!userId || !habitId) return;

  // Sync deletion to Supabase
  try {
    await deleteHabitFromSupabase(userId, habitId);
  } catch (e) {
    console.warn("Supabase delete habit sync warning:", e);
  }

  if (!isFirebaseEnabled || !db) return;
  const path = `users/${userId}/habits/${habitId}`;
  try {
    await deleteDoc(doc(db, "users", userId, "habits", habitId));
    
    // Also clean up any associated habitLogs from Firestore
    try {
      const logsCol = collection(db, "users", userId, "habitLogs");
      const q = query(logsCol, where("habitId", "==", habitId));
      const snap = await getDocs(q);
      for (const d of snap.docs) {
        await deleteDoc(d.ref);
      }
    } catch (_) {}
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ==================== HABIT LOGS SERVICES ====================

export function subscribeHabitLogs(userId: string, callback: (logs: HabitLogDoc[]) => void) {
  if (!userId || !isFirebaseEnabled || !db) {
    callback([]);
    return () => {};
  }
  const logsCol = collection(db, "users", userId, "habitLogs");

  // Immediate direct fetch
  getDocs(logsCol).then((snapshot) => {
    if (!snapshot.empty) {
      const logs = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data()
      })) as HabitLogDoc[];
      callback(logs);
    }
  }).catch(err => console.warn("Direct logs fetch notice:", err));

  return onSnapshot(
    logsCol,
    (snapshot) => {
      const logs = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data()
      })) as HabitLogDoc[];
      callback(logs);
    },
    (error) => {
      console.warn("Habit logs snapshot listener warning:", error);
      fetchUserHabitLogsDirectly(userId).then(logs => {
        if (logs.length > 0) callback(logs);
      });
    }
  );
}

export async function setHabitLogStatus(
  userId: string, 
  habitId: string, 
  dateStr: string, 
  status: "completed" | "skipped" | "missed" | null
) {
  if (!userId || !habitId) return;

  // Sync habit mark directly to Supabase database
  try {
    await saveHabitLogToSupabase(userId, habitId, dateStr, status);
  } catch (e) {
    console.warn("Supabase habit mark sync notice:", e);
  }

  if (!isFirebaseEnabled || !db) return;
  const docId = `${habitId}_${dateStr}`;
  const path = `users/${userId}/habitLogs/${docId}`;
  const logRef = doc(db, "users", userId, "habitLogs", docId);

  try {
    if (status === null) {
      await deleteDoc(logRef);
    } else {
      const now = new Date().toISOString();
      const payload: HabitLogDoc = {
        id: docId,
        habitId,
        date: dateStr,
        status,
        completedAt: status === "completed" ? now : "",
        createdAt: now
      };
      await setDoc(logRef, payload);
    }
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.WRITE, path);
    } catch (err) {
      console.warn("Handled habit log sync error gracefully:", err);
    }
  }
}

// ==================== GOALS SERVICES ====================

export function subscribeGoals(userId: string, callback: (goals: GoalDoc[]) => void) {
  if (!userId || !isFirebaseEnabled || !db) {
    callback([]);
    return () => {};
  }
  const path = `users/${userId}/goals`;
  const goalsCol = collection(db, "users", userId, "goals");

  return onSnapshot(
    goalsCol,
    (snapshot) => {
      const goals = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data()
      })) as GoalDoc[];
      callback(goals);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (err) {
        console.warn("Handled goals snapshot error:", err);
      }
    }
  );
}

export async function addGoalToFirestore(userId: string, goal: Omit<GoalDoc, "id" | "createdAt">) {
  if (!userId || !isFirebaseEnabled || !db) return;
  const id = `g_${Date.now()}`;
  const path = `users/${userId}/goals/${id}`;
  const payload: GoalDoc = {
    id,
    ...goal,
    createdAt: new Date().toISOString()
  };
  try {
    await setDoc(doc(db, "users", userId, "goals", id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ==================== REMINDERS SERVICES ====================

export function subscribeReminders(userId: string, callback: (reminders: ReminderDoc[]) => void) {
  if (!userId || !isFirebaseEnabled || !db) {
    callback([]);
    return () => {};
  }
  const path = `users/${userId}/reminders`;
  const colRef = collection(db, "users", userId, "reminders");

  return onSnapshot(
    colRef,
    (snapshot) => {
      const reminders = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data()
      })) as ReminderDoc[];
      callback(reminders);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (err) {
        console.warn("Handled reminders snapshot error:", err);
      }
    }
  );
}

// ==================== CHAT HISTORY SERVICES ====================

export function subscribeChatHistory(userId: string, callback: (messages: ChatMessage[]) => void) {
  if (!userId || !isFirebaseEnabled || !db) {
    callback([]);
    return () => {};
  }
  const path = `users/${userId}/chatHistory`;
  const colRef = collection(db, "users", userId, "chatHistory");

  return onSnapshot(
    colRef,
    (snapshot) => {
      const messages: ChatMessage[] = [];
      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();
        messages.push({
          id: docSnap.id,
          role: data.role,
          content: data.content,
          timestamp: new Date(data.timestamp || Date.now())
        });
      });
      messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      callback(messages);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (err) {
        console.warn("Handled chatHistory snapshot error:", err);
      }
    }
  );
}

export async function addChatMessageToFirestore(userId: string, msg: ChatMessage) {
  if (!userId || !isFirebaseEnabled || !db) return;
  const path = `users/${userId}/chatHistory/${msg.id}`;
  try {
    await setDoc(doc(db, "users", userId, "chatHistory", msg.id), {
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

