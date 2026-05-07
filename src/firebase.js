// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDmmWMq6HAenRa6ffpT1OlQcxOncAdbTjk",
  authDomain: "fakepedia-e681e.firebaseapp.com",
  projectId: "fakepedia-e681e",
  storageBucket: "fakepedia-e681e.firebasestorage.app",
  messagingSenderId: "932346804341",
  appId: "1:932346804341:web:757a60d19e9bb0a5eaa03c",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
