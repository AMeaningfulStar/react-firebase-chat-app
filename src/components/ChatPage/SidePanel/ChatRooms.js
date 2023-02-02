import React, { useState, useEffect } from "react";
import { FaRegSmileWink, FaPlus } from 'react-icons/fa';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { useSelector, useDispatch } from "react-redux";
import { setCurrentChatRoom, setPrivateChatRoom } from '../../../redux/actions/chatRoom_action';

import { child, getDatabase, onChildAdded, push, ref, update , off } from "firebase/database";

const ChatRooms = () => {
  // ChatRooms 컴포넌트에서 사용되는 데이터의 저장 변수
  const [ show, setShow ] = useState(false);
  const [ name, setName ] = useState('');
  const [ description, setDescription ] = useState('');
  const [ chatRooms, setChatRooms ] = useState([]);
  const [ activeChatRoomId, setActiveChatRoomId ] = useState('');
  const [ firstLoad, setFirstLoad ] = useState(true);

  const chatRoomsRef = ref(getDatabase(), 'chatRooms');
  
  const user = useSelector((state) => state.user.currentUser);
  const dispatch =useDispatch();

  // 모달창의 노출 여부를 결정하는 함수(handleClose, handleShow)
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // 방 생성 버튼 클릭 이벤트 함수
  const handleSubmit = (event) => {
    event.preventDefault()

    if(isFormValid(name, description)) {
      addChatRoom();
    }
  }

  // 방 생성 시 방의 이름과 설명을 입력했는지 검사하는 함수
  const isFormValid = (name, description) => name && description;
  
  // 방 생성 함수
  const addChatRoom = async() => {
    const key = push(chatRoomsRef).key;
    const newChatRooms = {
      id : key,
      name: name,
      description: description,
      createdBy: {
        name: user.displayName,
        image: user.photoURL
      }
    }

    try{
      await update(child(chatRoomsRef, key), newChatRooms);

      setName('');
      setDescription('');
      setShow(false);
    }
    catch (error) {
      alert(error);
    }
  }

  // ChatRoom들의 생성되었는지 감시하는 역할
  useEffect(() => {
    AddChatRoomsListeners();

    return () => off(chatRoomsRef);
  },[]);

  // ChatRoom 생성되었을 시 동작하는 함수
  const AddChatRoomsListeners = () => {
    let chatRoomsArray = [];
    
    onChildAdded(chatRoomsRef, (DataSnapshot) => {
      chatRoomsArray.push(DataSnapshot.val());
      setChatRooms(chatRoomsArray);
      setFirstChatRoom(chatRoomsArray);
    })
  }

  // 생성된 ChatRoom을 UI에 나타내는 함수
  const renderChatRooms = (chatRooms) => {
    if(chatRooms.length > 0){
      return chatRooms.map((room) => (
        <li
          key={ room.id }
          style={{ backgroundColor: room.id === activeChatRoomId && '#ffffff45'}}
          onClick={() => changeChatRoom(room)}
        >
          # { room.name }
        </li>
      ))
    }
  }

  // 생성된 ChatRoom 목록에서 선택 시 동작하는 이벤트 함수
  const changeChatRoom = (room) => {
    dispatch(setCurrentChatRoom(room));
    dispatch(setPrivateChatRoom(false));
    setActiveChatRoomId(room.id);
  }

  // 화면이 처음 렌더링 될 시 ChatRoom 중 처음 ChatRoom이 선택되어 있도록 하는 함수
  const setFirstChatRoom = (chatRooms) => {
    const firstChatRoom = chatRooms[0];

    if(firstLoad && chatRooms.length > 0){
      dispatch(setCurrentChatRoom(firstChatRoom));
      setActiveChatRoomId(firstChatRoom.id);
    }

    setFirstLoad(false);
  }

  return(
    <div>
      <div 
        style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center'}}
      >
        <FaRegSmileWink style={{ marginRight: 3 }} />
        CHAT ROOMS {" "}
        <FaPlus
          onClick={handleShow}
          style={{ position: 'absolute', right: 0, cursor: 'pointer' }}
        />
      </div>
      
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        { renderChatRooms(chatRooms) }
      </ul>

      {/* ADD CHAT ROOM MODAL */}
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Create a chat room</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formBasicEmail">
              <Form.Label>Chat room name</Form.Label>
              <Form.Control
                onChange={(event) => setName(event.target.value)}
                type="text"
                placeholder="Enter a chat room name"
              />
            </Form.Group>

            <Form.Group controlId="formBasicPassword">
              <Form.Label>Chat room description</Form.Label>
              <Form.Control
                onChange={(event) => setDescription(event.target.value)}
                type="text"
                placeholder="Enter a chat room description"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            New Chat Room
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default ChatRooms