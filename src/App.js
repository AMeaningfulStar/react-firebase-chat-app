import './App.css';
import React, { useEffect }from 'react';
import { Routes, Route, useNavigate } from "react-router-dom";

import ChatPage from './components/ChatPage/ChatPage';
import LoginPage from './components/LoginPage/LoginPage';
import RegisterPage from './components/RegisterPage/RegisterPage';

import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

import { useDispatch, useSelector } from 'react-redux';
import { clearUser, setUser } from './redux/actions/user_action';

function App(props) {
  const navigate = useNavigate(); // 강제 경로 이동
  let dispatch = useDispatch();
  const isLoading = useSelector((state) => state.user.isLoading);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/");
        dispatch(setUser(user));

        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        // const uid = user.uid;
        // ...
      } else {
        navigate("/login");
        dispatch(clearUser());
        // User is signed out
        // ...
      }
    });
  }, []);

  if(isLoading) {
    return <div>...Loading</div>
  }
  else {
    return (
      <Routes>
        <Route path="/" element={<ChatPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    );
  }
}

export default App;