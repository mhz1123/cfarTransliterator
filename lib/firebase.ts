// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
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
const analytics = getAnalytics(app);