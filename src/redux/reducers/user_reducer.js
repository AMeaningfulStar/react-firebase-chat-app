import { SET_USER, CLEAR_USER, SET_PHOTO_URL } from "../actions/types";

// user 정보를 담을 변수 = currentUser
// 로그인 하는 시작(true)과 끝(false) = isLoading
const initialUserState = {
  currentUser: null,
  isLoading: true
}

export default function (state = initialUserState, action) {
  switch (action.type) {
    case SET_USER:
      return {
        ...state,
        currentUser: action.payload,
        isLoading: false
      }
    case CLEAR_USER:
      return {
        ...state,
        currentUser: null,
        isLoading: false
      }
    case SET_PHOTO_URL:
      return {
        ...state,
        currentUser: { ...state.currentUser, photoURL: action.payload },
        isLoading: false
      }
    default:
      return state;
  }
}

