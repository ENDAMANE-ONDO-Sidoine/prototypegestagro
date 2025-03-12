// src/firebase/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth"; // Importez GoogleAuthProvider
import { getFirestore } from "firebase/firestore";

// Configuration Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBkI-EXD66YGdlILnOy4vdRI-5jUND1WOs",
    authDomain: "prototypegestagro.firebaseapp.com",
    projectId: "prototypegestagro",
    storageBucket: "prototypegestagro.firebasestorage.app",
    messagingSenderId: "607527869894",
    appId: "1:607527869894:web:5c3c8366d427f5f7c126c7",
    measurementId: "G-0Z4QRX516M"
  };
  

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Initialiser les services Firebase
const auth = getAuth(app);
const firestore = getFirestore(app);

// Configurer Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Exporter les services Firebase
export { auth, firestore, googleProvider }; 