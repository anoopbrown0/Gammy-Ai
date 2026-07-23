import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
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
    return "Sign-in popup was blocked by your browser. Please allow popups or use Email sign-in / Guest mode.";
  }
  if (rawMsg.includes("auth/unauthorized-domain")) {
    return "This shared domain requires OAuth domain authorization in Firebase Console. Please sign in with Email or Guest Mode.";
  }
  if (rawMsg.includes("auth/popup-closed-by-user")) {
    return "Google sign-in window was closed before completing.";
  }
  if (rawMsg.includes("auth/cancelled-popup-request")) {
    return "Sign-in request was cancelled.";
  }
  if (rawMsg.includes("auth/operation-not-allowed")) {
    return "Google Authentication is not enabled in Firebase project settings. Please sign in with Email or Guest Mode.";
  }
  if (rawMsg.includes("auth/invalid-credential") || rawMsg.includes("auth/wrong-password")) {
    return "Invalid email or password. Please check your credentials.";
  }
  if (rawMsg.includes("auth/email-already-in-use")) {
    return "An account with this email address already exists. Please log in.";
  }
  if (rawMsg.includes("auth/weak-password")) {
    return "Password should be at least 6 characters long.";
  }
  if (rawMsg.includes("auth/user-not-found")) {
    return "No account found with this email address.";
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

export async function registerUserWithEmail(email: string, pass: string, name: string) {
  if (!isFirebaseEnabled || !auth) {
    throw new Error("Firebase Authentication is not configured.");
  }
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (name && cred.user) {
      await updateProfile(cred.user, { displayName: name });
    }
    if (cred.user) {
      await syncUserProfile(cred.user, { name });
    }
    return cred.user;
  } catch (error: any) {
    console.error("Error signing up:", error);
    throw new Error(formatAuthOrFirestoreError(error));
  }
}

export async function loginUserWithEmail(email: string, pass: string) {
  if (!isFirebaseEnabled || !auth) {
    throw new Error("Firebase Authentication is not configured.");
  }
  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    return cred.user;
  } catch (error: any) {
    console.error("Error signing in:", error);
    throw new Error(formatAuthOrFirestoreError(error));
  }
}

export async function loginWithGoogle() {
  if (!isFirebaseEnabled || !auth) {
    throw new Error("Firebase Authentication is not configured.");
  }
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    if (result.user) {
      await syncUserProfile(result.user);
    }
    return result.user;
  } catch (error: any) {
    console.error("Error signing in with Google:", error);
    throw new Error(formatAuthOrFirestoreError(error));
  }
}

export async function loginAsGuest() {
  const guestUser: any = {
    uid: "guest_" + Date.now().toString(36),
    displayName: "Guest Explorer",
    email: "guest@gammy.app",
    photoURL: "",
    emailVerified: true,
    isAnonymous: true
  };
  localStorage.setItem("sabit_mock_user", JSON.stringify(guestUser));
  localStorage.setItem("sabit_profile_name", "Guest Explorer");
  localStorage.setItem("sabit_profile_email", "guest@gammy.app");
  window.dispatchEvent(new CustomEvent("sabit_profile_changed", { detail: "Guest Explorer" }));
  return guestUser;
}

export async function logoutUser() {
  if (auth) {
    try {
      await firebaseSignOut(auth);
    } catch (_) {}
  }
  localStorage.removeItem("sabit_mock_user");
}

export async function sendPasswordReset(email: string) {
  if (!isFirebaseEnabled || !auth) {
    throw new Error("Firebase Authentication is not configured.");
  }
  try {
    return await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    throw new Error(formatAuthOrFirestoreError(error));
  }
}

export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  if (!auth) return () => {};
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
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

export function subscribeHabits(userId: string, callback: (habits: any[]) => void) {
  if (!userId || !isFirebaseEnabled || !db) {
    callback([]);
    return () => {};
  }
  const path = `users/${userId}/habits`;
  const habitsCol = collection(db, "users", userId, "habits");
  
  return onSnapshot(
    habitsCol,
    (snapshot) => {
      const habits = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data()
      }));
      callback(habits);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (err) {
        console.warn("Handled habits snapshot error:", err);
      }
    }
  );
}

export async function addHabitToFirestore(userId: string, habitData: Omit<Habit, "id" | "days" | "streak">) {
  if (!userId || !isFirebaseEnabled || !db) return null;
  const habitId = `h_${Date.now()}`;
  const path = `users/${userId}/habits/${habitId}`;
  const now = new Date().toISOString();
  
  const payload = {
    id: habitId,
    name: habitData.name,
    icon: habitData.iconName || "Target",
    color: habitData.color || "#2563EB",
    category: habitData.category || "habit",
    goal: habitData.goal || "1x / day",
    frequency: habitData.frequency || "daily",
    reminderTime: habitData.reminderTime || "09:00",
    active: true,
    createdAt: now,
    updatedAt: now
  };

  try {
    await setDoc(doc(db, "users", userId, "habits", habitId), payload);
    return habitId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return null;
  }
}

export async function updateHabitInFirestore(userId: string, habitId: string, habitData: Partial<Habit>) {
  if (!userId || !habitId || !isFirebaseEnabled || !db) return;
  const path = `users/${userId}/habits/${habitId}`;
  const habitRef = doc(db, "users", userId, "habits", habitId);
  const now = new Date().toISOString();

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
  if (!userId || !habitId || !isFirebaseEnabled || !db) return;
  const path = `users/${userId}/habits/${habitId}`;
  try {
    await deleteDoc(doc(db, "users", userId, "habits", habitId));
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
  const path = `users/${userId}/habitLogs`;
  const logsCol = collection(db, "users", userId, "habitLogs");

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
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (err) {
        console.warn("Handled habitLogs snapshot error:", err);
      }
    }
  );
}

export async function setHabitLogStatus(
  userId: string, 
  habitId: string, 
  dateStr: string, 
  status: "completed" | "skipped" | "missed" | null
) {
  if (!userId || !habitId || !isFirebaseEnabled || !db) return;
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
    handleFirestoreError(error, OperationType.WRITE, path);
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

