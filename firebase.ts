
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

/**
 * speedOps Operational Cloud Configuration.
 * Connected to Firebase project: fanaops-1
 */
const firebaseConfig = {
  apiKey: "AIzaSyBo6juFXtqnUwpR8Lqc-pP6oT3BOlmu8jo",
  authDomain: "fanaops-1.firebaseapp.com",
  projectId: "fanaops-1",
  storageBucket: "fanaops-1.firebasestorage.app",
  messagingSenderId: "474487802950",
  appId: "1:474487802950:web:d273c8c0071ad7b6540e47",
  measurementId: "G-6C8V1F9K47"
};

// Initialize Firebase Application
const app = initializeApp(firebaseConfig);

// Export Operational Services
export const db = getFirestore(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
