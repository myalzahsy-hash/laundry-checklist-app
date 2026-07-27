import { initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth, signInAnonymously, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let firestore: Firestore | null = null;
let auth: Auth | null = null;
let initError: string | null = null;
let authReady: Promise<void> | null = null;

function isConfigValid(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
}

function initializeFirebase() {
  if (app) return;

  if (!isConfigValid()) {
    initError = "Firebase belum dikonfigurasi. Periksa file .env";
    return;
  }

  try {
    app = initializeApp(firebaseConfig);
    firestore = getFirestore(app);
    auth = getAuth(app);
  } catch (error) {
    initError = error instanceof Error ? error.message : "Gagal menginisialisasi Firebase";
    app = null;
    firestore = null;
    auth = null;
  }
}

function ensureAnonymousAuth(): Promise<void> {
  if (!auth) {
    initializeFirebase();
  }
  if (!auth) {
    return Promise.resolve();
  }

  if (auth.currentUser) {
    return Promise.resolve();
  }

  if (authReady) {
    return authReady;
  }

  authReady = new Promise<void>((resolve) => {
    const timeout = setTimeout(() => {
      resolve();
    }, 10000);

    onAuthStateChanged(auth!, (user) => {
      if (user) {
        clearTimeout(timeout);
        resolve();
      }
    });

    signInAnonymously(auth!).catch(() => {
      clearTimeout(timeout);
      resolve();
    });
  });

  return authReady;
}

export function getDb(): Firestore {
  initializeFirebase();
  if (!firestore) {
    throw new Error(initError ?? "Firestore tidak tersedia");
  }
  return firestore;
}

export function getFirebaseAuth(): Auth {
  initializeFirebase();
  if (!auth) {
    throw new Error(initError ?? "Firebase Auth tidak tersedia");
  }
  return auth;
}

export function getFirebaseApp(): FirebaseApp {
  initializeFirebase();
  if (!app) {
    throw new Error(initError ?? "Firebase App tidak tersedia");
  }
  return app;
}

export function getFirebaseError(): string | null {
  initializeFirebase();
  return initError;
}

export function isFirebaseReady(): boolean {
  initializeFirebase();
  return app !== null;
}

export { ensureAnonymousAuth };
