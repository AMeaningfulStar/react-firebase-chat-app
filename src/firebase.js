// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDKI9iP4NJ4l9j_5LiugwpVbaZSwBg-kQk",
  authDomain: "react-firebase-chat-app-da149.firebaseapp.com",
  projectId: "react-firebase-chat-app-da149",
  storageBucket: "react-firebase-chat-app-da149.appspot.com",
  messagingSenderId: "649111989896",
  appId: "1:649111989896:web:6212559aa61d813689393d",
  measurementId: "G-E79YFCK0Z6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);