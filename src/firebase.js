import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDKI9iP4NJ4l9j_5LiugwpVbaZSwBg-kQk",
  authDomain: "react-firebase-chat-app-da149.firebaseapp.com",
  projectId: "react-firebase-chat-app-da149",
  storageBucket: "react-firebase-chat-app-da149.appspot.com",
  messagingSenderId: "649111989896",
  appId: "1:649111989896:web:6212559aa61d813689393d",
  measurementId: "G-E79YFCK0Z6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const storage = getStorage();

export { app, auth, storage };