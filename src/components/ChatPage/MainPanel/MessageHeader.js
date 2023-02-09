import React, { useEffect, useState } from "react";
import { Container, Row, Col, InputGroup, Form, Image, Accordion } from "react-bootstrap";
import { AiFillUnlock, AiOutlineSearch, AiFillLock } from 'react-icons/ai';
import { MdFavorite, MdFavoriteBorder } from 'react-icons/md';
import { useSelector } from "react-redux";

import { child, remove, ref, getDatabase, update, onValue } from "firebase/database";

const MessageHeader = ({ handleSearchChange }) => {
  const user = useSelector((state) => state.user.currentUser);
  const chatRoom = useSelector((state) => state.chatRoom.currentChatRoom);
  const isPrivateChatRoom = useSelector((state) => state.chatRoom.isPrivateChatRoom);
  const userPosts = useSelector((state => state.chatRoom.userPosts))

  const [ isFavorited,  setIsFavorited ] = useState(false);

  const userRef = ref(getDatabase(), 'users');

  useEffect(() => {
    if(chatRoom && user) {
      addFavoriteListener(chatRoom.id, user.uid);
    }
  }, [])

  const addFavoriteListener = (chatRoomId, userId) => {
    onValue(child(userRef, `${ userId }/favorited`), (data) => {
      if(data.val() !== null) {
        const chatRoomIds = Object.keys(data.val());
        const isAlreadyFavorited = chatRoomIds.includes(chatRoomId);
        setIsFavorited(isAlreadyFavorited);
      }
    })
  }

  const handleFavorite = () => {
    if(isFavorited) {
      setIsFavorited(prev => !prev);
      remove(child(userRef, `${ user.uid }/favorited/${ chatRoom.id }`))
    }
    else {
      setIsFavorited(prev => !prev);
      update(child(userRef, `${ user.uid }/favorited`),{
        [chatRoom.id]: {
          name: chatRoom.name,
          description: chatRoom.description,
          createdBy: {
            name: chatRoom.createdBy.name,
            image: chatRoom.createdBy.image
          } 
        }
      })
    }
  }

  const renderUserPosts = (userPosts) => {
    //  Object.entries() 함수를 이용하여 객체를 배열로 변환
    // sort() 함수를 이용하여 count의 개수에 따라 정렬
    return Object.entries(userPosts)
      .sort((userA, userB) => userB[1].count - userA[1].count)
      .map(([key, val], i) => (
        <div key={i} style={{ display: 'flex' }}>
          <img 
            style={{ borderRadius: 25 }}
            width={48}
            height={48}
            className='mr-3'
            src={val.image}
            alt={val.name}
          />
          <div>
            <h6>{ key }</h6>
            <p>
              { val.count }개
            </p>
          </div>
        </div>
      ))
  }

  return(
    <div style={{ width: '100%', height: '190px', border: '.2rem solid #ececec', borderRedius: '4px', padding: '1rem', marginBottom: '1rem' }}>
      <Container>
        <Row>
          <Col>
            <h3>
              { isPrivateChatRoom ? <AiFillLock style={{ marginBottom: '10px' }} /> : <AiFillUnlock style={{ marginBottom: '10px' }} />}
              
              { chatRoom && chatRoom.name }
              
              { !isPrivateChatRoom &&
                <span style={{ cursor: 'pointer'}} onClick={ handleFavorite }>
                  { isFavorited ? <MdFavorite style={{ marginBottom: '5px' }} /> : <MdFavoriteBorder style={{ marginBottom: '5px' }}/>}
                </span>
              }
            </h3>  
          </Col>
          <Col>
          <InputGroup className="mb-3">
            <InputGroup.Text id="basic-addon1">
              <AiOutlineSearch />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search Messages"
              aria-label="Search"
              aria-describedby="basic-addon1"
              onChange={ handleSearchChange }
            />
          </InputGroup>
          </Col>
        </Row>

        {!isPrivateChatRoom &&
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <p>
              <Image
                src={ chatRoom && chatRoom.createdBy.image }
                alt={ chatRoom && chatRoom.createdBy.name }
                style={{ width: '30px', height: '30px' }}
                roundedCircle
              />
                {" "}{ chatRoom && chatRoom.createdBy.name }
            </p>
          </div>  
        }
      
        <Row>
          <Col>
            <Accordion>
              <Accordion.Item eventKey="0">
                <Accordion.Header>Description</Accordion.Header>
                <Accordion.Body>
                  { chatRoom && chatRoom.description }
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </Col>
          <Col>
            <Accordion>
              <Accordion.Item eventKey="0">
                <Accordion.Header>Posts Count</Accordion.Header>
                <Accordion.Body>
                  { userPosts && renderUserPosts(userPosts) }
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default MessageHeader