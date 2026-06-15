
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCWc_EExyqMuModGkayIjaNvPc3tn_AR0E",
  authDomain: "studyscope-ai.firebaseapp.com",
  projectId: "studyscope-ai",
  storageBucket: "studyscope-ai.firebasestorage.app",
  messagingSenderId: "963786690238",
  appId: "1:963786690238:web:8610ab80442a54c13218ef",
  measurementId: "G-70WG6S9C0J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
