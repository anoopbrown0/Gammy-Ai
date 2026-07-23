import { initializeApp, getApp, getApps } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
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

// Read environment variables with fallback to firebase-applet-config.json
const metaEnv = (import.meta as any).env || {};
const firebaseConfig = {
  apiKey: firebaseAppletConfig?.apiKey || metaEnv.VITE_FIREBASE_API_KEY,
  authDomain: firebaseAppletConfig?.authDomain || metaEnv.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: firebaseAppletConfig?.projectId || metaEnv.VITE_FIREBASE_PROJECT_ID,
  storageBucket: firebaseAppletConfig?.storageBucket || metaEnv.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: firebaseAppletConfig?.messagingSenderId || metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: firebaseAppletConfig?.appId || metaEnv.VITE_FIREBASE_APP_ID,
  firestoreDatabaseId: firebaseAppletConfig?.firestoreDatabaseId
};

const hasCredentials = !!firebaseConfig.apiKey;

let app;
let authInstance: any;
let dbInstance: any;
let isFirebaseEnabled = false;

if (hasCredentials) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    authInstance = getAuth(app);
    dbInstance = firebaseConfig.firestoreDatabaseId
      ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
      : getFirestore(app);
    isFirebaseEnabled = true;
    console.log("🔥 Firebase successfully initialized with live client SDK configuration.");
  } catch (error) {
    console.error("Failed to initialize Firebase client SDK:", error);
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
      this.currentUser = JSON.parse(savedUser);
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
    // Generate a beautiful Mock User
    this.currentUser = {
      uid: "mock_user_anoop_brown",
      displayName: localStorage.getItem("sabit_profile_name") || "Anoop Brown",
      email: localStorage.getItem("sabit_profile_email") || "anoopbrown0@gmail.com",
      photoURL: localStorage.getItem("sabit_banner_image") || null,
      emailVerified: true,
      isAnonymous: false
    };
    localStorage.setItem("sabit_mock_user", JSON.stringify(this.currentUser));
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
