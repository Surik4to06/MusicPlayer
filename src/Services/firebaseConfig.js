// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBzTWMiSHh0ijFj810aHXoBh1YKbbMyAvw",
  authDomain: "musicplayer-6307a.firebaseapp.com",
  projectId: "musicplayer-6307a",
  storageBucket: "musicplayer-6307a.firebasestorage.app",
  messagingSenderId: "1000843706243",
  appId: "1:1000843706243:web:ff07f6d151de0e851ac0b6",
  measurementId: "G-HVQSY6M80K"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const Auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});