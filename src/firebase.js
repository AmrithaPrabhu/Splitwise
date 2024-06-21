// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_KEY,
  authDomain: "cash-man-bdfc3.firebaseapp.com",
  projectId: "cash-man-bdfc3",
  storageBucket: "cash-man-bdfc3.appspot.com",
  messagingSenderId: "110760852752",
  appId: "1:110760852752:web:ed4fe278cd97884db9f995"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);