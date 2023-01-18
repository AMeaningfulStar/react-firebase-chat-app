import React, { useRef } from "react";
import { IoIosChatboxes } from 'react-icons/io';
import Dropdown from 'react-bootstrap/Dropdown';
import Image from 'react-bootstrap/Image';

import { useSelector, useDispatch } from "react-redux";
import { setPhotoURL } from "../../../redux/actions/user_action";

import { auth, storage } from '../../../firebase';
import { signOut, updateProfile } from "firebase/auth";
import { uploadBytesResumable, ref as strRef, getDownloadURL } from "firebase/storage";
import { getDatabase, ref, update } from "firebase/database";

const UserPanel = () => {
  const user = useSelector((state) => state.user.currentUser);
  const inputOpenImageRef = useRef();
  const dispatch = useDispatch();

  // 로그아웃 이벤트 함수
  const handleLogout = () => {
    signOut(auth).then(() => {

    }).catch((error) => {

    })
  }

  // 프로필 변경 클릭 이벤트 함수
  const handleOpenImageRef = () => {
    inputOpenImageRef.current.click();
  }

  // 프로필 이미지 업로드 이벤트 함수
  const handleUploadImage = async(event) => {
    const file = event.target.files[0];
    const user = auth.currentUser;

    const metadata = { contentType: file.type };

    try{
      // Firebase Storage에 저장
      // user_image폴더 안에 user.uid의 이름으로 업로드할 파일(file)을 지정한 타입(metadata)으로 저장한다. 
      let uploadTask = await uploadBytesResumable(strRef(storage, `user_image/${ user.uid }`), file, metadata);

      await getDownloadURL(uploadTask.ref).then((downloadURL) => {
        updateProfile(user, {
          photoURL: downloadURL
        });

        dispatch(setPhotoURL(downloadURL));

        update(ref(getDatabase(), `user/${ user.uid }`), { image : downloadURL})
      })
    }
    catch (error) {
      console.log(error);
    }
  }

  return(
    <div>
      {/* Logo */}
      <h3 style={{ color: 'white'}}>
        <IoIosChatboxes />{" "}Chat App
      </h3>

      {/* Profile */}
      <div style={{ display: 'flex', marginBottom: '1rem' }}>
        <Image
          src={user && user.photoURL}
          style={{ width: '30px', height: '30px', marginTop: '3px' }}
          roundedCircle
        />

        <Dropdown>
          <Dropdown.Toggle
            id="dropdown-basic"
            style={{ background: 'transparent', border: '0px' }}
          >
            {user && user.displayName}
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item onClick={handleOpenImageRef}>
              프로필 사진 변경
            </Dropdown.Item>
            <Dropdown.Item onClick={handleLogout}>
              로그아웃
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      {/* 선택할 수 있는 파일 중 이미지 파일(jpeg&png)만 선택할 수 있도록 제어 : accept="image/jpeg,, image/png" */}
      <input
        onChange={handleUploadImage}
        accept="image/jpeg,, image/png"
        style={{ display: 'none' }}
        ref={inputOpenImageRef}
        type='file'
      />
    </div>
  )
}

export default UserPanel