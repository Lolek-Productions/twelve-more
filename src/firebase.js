// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "twelvemore-app.firebaseapp.com",
  projectId: "twelvemore-app",
  storageBucket: "twelvemore-app.firebasestorage.app",
  messagingSenderId: "336529762816",
  appId: "1:336529762816:web:aa7f563725de422eef46e5"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
