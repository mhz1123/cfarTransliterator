// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported, logEvent } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyASgZ4d5EE0SVGN9iOV7_VwhXEMn422ftg",
  authDomain: "cfartransliterator.firebaseapp.com",
  projectId: "cfartransliterator",
  storageBucket: "cfartransliterator.firebasestorage.app",
  messagingSenderId: "183963657730",
  appId: "1:183963657730:web:7af687ae4c9a0f500a291b",
  measurementId: "G-8GQCNZB0S6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics with proper error handling
let analytics: any = null;

// Check if analytics is supported and initialize it
const initializeAnalytics = async () => {
  try {
    const analyticsSupported = await isSupported();
    if (analyticsSupported) {
      analytics = getAnalytics(app);
      console.log('Firebase Analytics initialized successfully');
      
      // Log a test event to verify analytics is working
      logEvent(analytics, 'app_initialized', {
        app_name: 'C-FAR Transliterator',
        timestamp: new Date().toISOString()
      });
    } else {
      console.warn('Firebase Analytics is not supported in this environment');
    }
  } catch (error) {
    console.error('Failed to initialize Firebase Analytics:', error);
  }
};

// Initialize analytics when the module is loaded
if (typeof window !== 'undefined') {
  initializeAnalytics();
}

// Export analytics instance and helper functions
export { app, analytics };

// Helper function to log custom events
export const logAnalyticsEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (analytics) {
    try {
      logEvent(analytics, eventName, parameters);
      console.log(`Analytics event logged: ${eventName}`, parameters);
    } catch (error) {
      console.error('Failed to log analytics event:', error);
    }
  }
};