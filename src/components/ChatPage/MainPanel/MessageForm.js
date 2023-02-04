import React, { useRef, useState } from "react";
import { Col, Form, ProgressBar, Row } from "react-bootstrap";
import { child, getDatabase, push, ref, set } from "firebase/database";
import { useSelector } from "react-redux";

import { getStorage, ref as strRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../../firebase";

const MessageForm = () => {
  const [ content, setContent ] = useState('');
  const [ errors, setErrors ] = useState([]);
  const [ loading, setLoading ] = useState(false);
  const [ percentage, setPercentage ] = useState(0);
  const messagesRef = ref(getDatabase(), 'messages');
  const inputOpenImageRef = useRef();

  // Redux에 있는 정보
  const chatRoom = useSelector((state) => state.chatRoom.currentChatRoom);
  const user = useSelector((state) => state.user.currentUser);
  const isPrivateChatRoom = useSelector(state => state.chatRoom.isPrivateChatRoom);

  const handleChange = (event) => {
    setContent(event.target.value);
  }

  const handleSubmit = async() => {
    // content가 없을 시 에러 발생
    if(!content){
      setErrors((prev) => prev.concat('Type contents first'));
      return;
    }

    setLoading(true);
    // Firebase에 입력한 message를 저장
    try{
      await set(push(child(messagesRef, chatRoom.id)), createMessage());

      setLoading(false);
      setContent('');
      setErrors([]);
    }
    catch(error){
      setErrors((prev) => prev.concat(error.message));
      setLoading(false);
      setTimeout(() => { setErrors([]) }, 5000);
    }
  }

  const createMessage = (fileUrl = null) => {
    // message 입력한 시간 및 user정보
    const message = {
      timestamp: Date.now(),
      user: {
        id: user.uid,
        name: user.displayName,
        image: user.photoURL
      }
    }
    
    // file 및 message를 구분
    if( fileUrl !== null ){
      message['image'] = fileUrl;
    }
    else {
      message['content'] = content;
    }

    return message;
  }

  const handleOpenImageRef = () => {
    inputOpenImageRef.current.click()
  }

  const getPath = () => {
    if(isPrivateChatRoom) {
      return `/message/private/${chatRoom.id}`;
    }
    else {
      return `/message/public`
    }
  }

  const handleUploadImage = (event) => {
    const file = event.target.files[0];

    const filePath = `${ getPath()}/${ file.name }`;
    const metaData = { contentType: file.type };

    try {
      // 업로드하는 파일을 먼저 storage에 저장
      const storageRef = strRef(storage, filePath);
      const uploadTask = uploadBytesResumable(storageRef, file, metaData);

      // 파일이 저장되는 퍼센티지 구하기
      uploadTask.on('state_chaged',
        (snapshot) => {
          const progress = Math.floor((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          
          setPercentage(progress);
          switch (snapshot.state) {
            case 'paused':
              console.log('Upload is paused');
              break;
            case 'running':
              console.log('Upload is running');
              break;
          }
        },
        (error) => {
          switch (error.code) {
            case 'storage/unauthorized':
              console.log('사용자는 원하는 작업을 수행할 권한이 없습니다. 보안 규칙이 올바른지 확인하십시오.');
              break;
            case 'storage/canceled':
              console.log('사용자가 작업을 취소했습니다.');
              break;
            case 'storage/unknown':
              console.log('알 수없는 오류가 발생했습니다.');
              break;
          }
        },
        () => {
          // 저장이 다 된 후에 파일 메세지 전송(데이터베이스에 저장)
          // 저장된 파일을 다운로드 받을 수 있는 URL 가져오기
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            set(push(child(messagesRef, chatRoom.id)), createMessage(downloadURL));
            setLoading(false);
          })
        }
      )
    }
    catch (error) {
      console.log(error)
    }
  }

  return(
    <div>
      <Form onSubmit={ handleSubmit }>
        <Form.Group controlId="exampleForm.ControlTextarea1">
          <Form.Control
            value={ content }
            onChange={ handleChange }
            as="textarea"
            rows={3}
          />
        </Form.Group>
      </Form>

      { !(percentage === 0 || percentage === 100) &&
        <ProgressBar variant="warning" label={`${ percentage }%`} now={ percentage } />
      }
      
      <div>
        { errors.map((errorMsg) => <p style={{ color: 'red' }} key={ errorMsg }>{ errorMsg }</p>)}
      </div>

      <Row>
        <Col>
          <button
            onClick={ handleSubmit }
            style={{ width: '100%' }}
            className='message-form-button' 
            disabled={ loading ? true : false }         
          >
            SEND
          </button>
        </Col>
        <Col>
          <button
            style={{ width: '100%' }}
            className='message-form-button'
            onClick={ handleOpenImageRef }
            disabled={ loading ? true : false }   
          >
            UPLOAD
          </button>
        </Col>
      </Row>

      <input
        accept="image/jpeg, image/png"
        style={{ display: 'none' }}
        type='file'
        ref={ inputOpenImageRef }
        onChange={ handleUploadImage }
      />
    </div>
  )
}

export default MessageForm