import React, { useState } from "react";
import { FaRegSmileWink, FaPlus } from 'react-icons/fa';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { connect } from "react-redux";

import { child, getDatabase, onChildAdded, push, ref, update } from "firebase/database";

const ChatRooms = ({user}) => {
  const [ show, setShow ] = useState(false);

  const [ name, setName ] = useState('');
  const [ description, setDescription ] = useState('');

  const chatRoomsRef = ref(getDatabase(), 'chatRooms');

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

    const componentDidmount = () => {
      AddChatRoomsListeners();
    }

    const AddChatRoomsListeners = () => {
      let chatRoomsArray = [];

      onChildAdded(chatRoomsRef, (DataSnapshot) => {
        chatRoomsArray.push(DataSnapshot.val());
        
      })
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

const mapStateToProps = state => {
  return{
    user: state.user.currentUser
  }
}

export default connect(mapStateToProps)(ChatRooms)