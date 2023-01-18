import { SET_USER, CLEAR_USER, SET_PHOTO_URL } from './types';

// 해당 함수를 호출하면 user_reducer.js에서 실행

// 로그인 시 user 정보를 저장하는 함수
export function setUser(user) {
  return {
    type: SET_USER,
    payload: user
  }
}

// 로그아웃 시 user 정보를 지우는 함수
export function clearUser() {
  return {
    type: CLEAR_USER
  }
}


export function setPhotoURL(photoURL) {
  return {
    type: SET_PHOTO_URL,
    payload: photoURL
  }
}


