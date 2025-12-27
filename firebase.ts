
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';

/**
 * speedOps Operational Cloud Configuration.
 * Connected to Firebase project: speedops-1
 */
const firebaseConfig = {
  apiKey: "AIzaSyCH-xkWv-pzGxiiGx1LV-m_0LNb6_osMKE",
  authDomain: "speedops-1.firebaseapp.com",
  projectId: "speedops-1",
  storageBucket: "speedops-1.firebasestorage.app",
  messagingSenderId: "407827264010",
  appId: "1:407827264010:web:bae368747306bb36a725f3",
  measurementId: "G-18QNZJWLVC"
};

// Initialize Firebase Application
const app = initializeApp(firebaseConfig);

// Export Operational Services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
