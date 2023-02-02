import React from "react";
import { Container, Row, Col, InputGroup, Form, Image, Accordion } from "react-bootstrap";
import { AiFillUnlock, AiOutlineSearch } from 'react-icons/ai';
import { MdFavorite } from 'react-icons/md';
import { useSelector } from "react-redux";

const MessageHeader = ({ handleSearchChange }) => {
  const user = useSelector((state) => state.user.currentUser);
  const chatRoom = useSelector((state) => state.chatRoom.currentChatRoom)
  return(
    <div style={{ width: '100%', height: '190px', border: '.2rem solid #ececec', borderRedius: '4px', padding: '1rem', marginBottom: '1rem' }}>
      <Container>
        <Row>
          <Col>
            <h3>
              <AiFillUnlock />qwe<MdFavorite />
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
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <p>
            <Image
              src={ user.photoURL }
              style={{ width: '30px', height: '30px' }}
              roundedCircle
            />
              {" "}{ user.displayName }
          </p>
        </div>
        <Row>
          <Col>
            <Accordion>
              <Accordion.Item eventKey="0">
                <Accordion.Header>Description</Accordion.Header>
                <Accordion.Body>
                  123
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </Col>
          <Col>
            <Accordion>
              <Accordion.Item eventKey="0">
                <Accordion.Header>Posts Count</Accordion.Header>
                <Accordion.Body>
                  123
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