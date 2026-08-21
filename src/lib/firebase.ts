import { initializeApp, getApp, getApps } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  query, 
  where, 
  addDoc,
  deleteDoc,
  getDocFromServer,
  Firestore
} from "firebase/firestore";
import firebaseAppletConfig from "../../firebase-applet-config.json";

// Load configuration from firebase-applet-config.json
const firebaseConfig = firebaseAppletConfig;

let app: any;
let authInstance: any;
let dbInstance: any;
let isFirebaseEnabled = false;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  authInstance = getAuth(app);
  dbInstance = (firebaseConfig as any)?.firestoreDatabaseId 
    ? getFirestore(app, (firebaseConfig as any).firestoreDatabaseId)
    : getFirestore(app);
  isFirebaseEnabled = true;
  console.log("🔥 Firebase successfully initialized with project:", firebaseConfig.projectId, "| DB:", (firebaseConfig as any)?.firestoreDatabaseId);
} catch (error) {
  console.error("Failed to initialize Firebase client SDK:", error);
}

// Connection test for Firestore per SKILL.md
async function testFirestoreConnection() {
  if (isFirebaseEnabled && dbInstance) {
    try {
      await getDocFromServer(doc(dbInstance, "test", "connection"));
    } catch (error) {
      if (error instanceof Error && error.message.includes("the client is offline")) {
        console.warn("Firestore client is offline, using offline cache.");
      }
    }
  }
}
testFirestoreConnection();

// Auto-initialize anonymous auth if no user is present to ensure immediate Firestore persistence
export async function ensureAnonymousAuth() {
  if (isFirebaseEnabled && authInstance) {
    if (!authInstance.currentUser) {
      try {
        await signInAnonymously(authInstance);
        console.log("🔥 Anonymous session authenticated for persistent Firestore ledger.");
      } catch (err) {
        console.warn("Anonymous auth notice (using local-first persistence):", err);
      }
    }
  }
}

// Custom error handler to match SKILL.md specifications
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const currentUser = authInstance?.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid,
      email: currentUser?.email,
      emailVerified: currentUser?.emailVerified,
      isAnonymous: currentUser?.isAnonymous,
      tenantId: currentUser?.tenantId,
      providerInfo: currentUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Define mock auth and db layers for local offline-first fallback
class MockAuth {
  private listeners: Array<(user: any) => void> = [];
  currentUser: any = null;

  constructor() {
    // Check if we have a saved mock user session in localStorage
    const savedUser = localStorage.getItem("sabit_mock_user");
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser);
      } catch (_) {}
    }
  }

  onAuthStateChanged(callback: (user: any) => void) {
    this.listeners.push(callback);
    // Execute immediately with current user
    callback(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private triggerChange() {
    this.listeners.forEach(l => l(this.currentUser));
  }

  async signInWithPopup() {
    const email = localStorage.getItem("sabit_profile_email") || "anoopbrown0@gmail.com";
    const name = localStorage.getItem("sabit_profile_name") || "Anoop Brown";
    const safeUid = `user_${btoa(email.toLowerCase()).replace(/[^a-zA-Z0-9]/g, '_')}`;
    this.currentUser = {
      uid: safeUid,
      displayName: name,
      email: email,
      photoURL: localStorage.getItem("sabit_banner_image") || null,
      emailVerified: true,
      isAnonymous: false
    };
    localStorage.setItem("sabit_mock_user", JSON.stringify(this.currentUser));
    localStorage.setItem("sabit_last_uid", safeUid);
    this.triggerChange();
    return { user: this.currentUser };
  }

  async signInWithEmailAndPassword(email: string, _pass: string) {
    const safeUid = `user_${btoa(email.toLowerCase()).replace(/[^a-zA-Z0-9]/g, '_')}`;
    const name = email.split("@")[0];
    this.currentUser = {
      uid: safeUid,
      displayName: name.charAt(0).toUpperCase() + name.slice(1),
      email: email,
      photoURL: null,
      emailVerified: true,
      isAnonymous: false
    };
    localStorage.setItem("sabit_mock_user", JSON.stringify(this.currentUser));
    localStorage.setItem("sabit_last_uid", safeUid);
    localStorage.setItem("sabit_profile_email", email);
    localStorage.setItem("sabit_profile_name", this.currentUser.displayName);
    this.triggerChange();
    return { user: this.currentUser };
  }

  async createUserWithEmailAndPassword(email: string, _pass: string, name?: string) {
    const safeUid = `user_${btoa(email.toLowerCase()).replace(/[^a-zA-Z0-9]/g, '_')}`;
    const displayName = name || (email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1));
    this.currentUser = {
      uid: safeUid,
      displayName: displayName,
      email: email,
      photoURL: null,
      emailVerified: true,
      isAnonymous: false
    };
    localStorage.setItem("sabit_mock_user", JSON.stringify(this.currentUser));
    localStorage.setItem("sabit_last_uid", safeUid);
    localStorage.setItem("sabit_profile_email", email);
    localStorage.setItem("sabit_profile_name", displayName);
    this.triggerChange();
    return { user: this.currentUser };
  }

  async signOut() {
    this.currentUser = null;
    localStorage.removeItem("sabit_mock_user");
    this.triggerChange();
  }
}

// Local mock auth if real auth is not available
const mockAuth = new MockAuth();

export const auth = isFirebaseEnabled ? authInstance : mockAuth;
export const db = dbInstance;
export { isFirebaseEnabled };

// Standard helper functions that handle real Firebase & fallback seamlessly
export async function signInWithGoogle() {
  if (isFirebaseEnabled) {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(authInstance, provider);
  } else {
    return mockAuth.signInWithPopup();
  }
}

export async function signOutUser() {
  if (isFirebaseEnabled) {
    return signOut(authInstance);
  } else {
    return mockAuth.signOut();
  }
}

// Sync Auth State callback helper
export function onAuthChanged(callback: (user: any) => void) {
  if (isFirebaseEnabled) {
    return onAuthStateChanged(authInstance, callback);
  } else {
    return mockAuth.onAuthStateChanged(callback);
  }
}

// Helper to save habits to Firestore (with localstorage fallback)
export async function saveHabitsToCloud(userId: string, habits: any[], month: string, year: string) {
  if (isFirebaseEnabled && dbInstance) {
    try {
      for (const habit of habits) {
        // Document ID is scoped by habit.id + month + year
        const docId = `${habit.id}_${month}_${year}`;
        const habitRef = doc(dbInstance, "users", userId, "habits", docId);
        await setDoc(habitRef, {
          ...habit,
          monthPartition: `${month}_${year}`
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${userId}/habits`);
    }
  }
}

// Helper to fetch habits from Firestore
export async function fetchHabitsFromCloud(userId: string, month: string, year: string): Promise<any[] | null> {
  if (isFirebaseEnabled && dbInstance) {
    const path = `users/${userId}/habits`;
    try {
      const habitsCol = collection(dbInstance, "users", userId, "habits");
      const q = query(habitsCol, where("monthPartition", "==", `${month}_${year}`));
      const querySnapshot = await getDocs(q);
      const habits: any[] = [];
      querySnapshot.forEach((doc) => {
        habits.push(doc.data());
      });
      return habits.length > 0 ? habits : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return null;
    }
  }
  return null;
}

// Helper to save user profile to Firestore
export async function saveUserProfileToCloud(userId: string, profile: any) {
  if (isFirebaseEnabled && dbInstance) {
    try {
      const userRef = doc(dbInstance, "users", userId);
      await setDoc(userRef, profile, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${userId}`);
    }
  }
}

// Helper to fetch user profile from Firestore
export async function fetchUserProfileFromCloud(userId: string): Promise<any | null> {
  if (isFirebaseEnabled && dbInstance) {
    const path = `users/${userId}`;
    try {
      const userRef = doc(dbInstance, "users", userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        return userSnap.data();
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  }
  return null;
}

// Helper to save a chat message to cloud
export async function saveChatMessageToCloud(userId: string, message: any) {
  if (isFirebaseEnabled && dbInstance) {
    try {
      const messageRef = doc(dbInstance, "users", userId, "chatHistory", message.id);
      await setDoc(messageRef, {
        ...message,
        // Convert timestamp to string if it is a Date
        timestamp: message.timestamp instanceof Date ? message.timestamp.toISOString() : message.timestamp
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${userId}/chatHistory/${message.id}`);
    }
  }
}

// Helper to fetch chat history from cloud
export async function fetchChatHistoryFromCloud(userId: string): Promise<any[] | null> {
  if (isFirebaseEnabled && dbInstance) {
    const path = `users/${userId}/chatHistory`;
    try {
      const colRef = collection(dbInstance, "users", userId, "chatHistory");
      const querySnapshot = await getDocs(colRef);
      const messages: any[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        messages.push({
          ...data,
          timestamp: new Date(data.timestamp)
        });
      });
      // Sort chronologically
      return messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  }
  return null;
}
