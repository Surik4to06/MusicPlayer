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
  apiKey: "AIzaSyDYL6sQhxqfQOap0jFpf48Xth9_hROnYW0",
  authDomain: "musicplayer-117b4.firebaseapp.com",
  projectId: "musicplayer-117b4",
  storageBucket: "musicplayer-117b4.firebasestorage.app",
  messagingSenderId: "348558580924",
  appId: "1:348558580924:web:113c92a35647574be044b9",
  measurementId: "G-4Z5KT77187"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export const Auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});