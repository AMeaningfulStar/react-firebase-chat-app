import React from "react";
import { Container, Row, Col, InputGroup, Form, Image, Accordion } from "react-bootstrap";
import { AiFillUnlock, AiOutlineSearch } from 'react-icons/ai';
import { MdFavorite } from 'react-icons/md';

const MessageHeader = () => {
  return(
    <div style={{ width: '100%', height: '190px', border: '.2rem solid #ececec', borderRedius: '4px', padding: '1rem', marginBottom: '1rem' }}>
      <Container>
        <Row>
          <Col>
            <h3>
              <AiFillUnlock /> qwe <MdFavorite />
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
            />
          </InputGroup>
          </Col>
        </Row>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <p>
            <Image
              src=""
              style={{ width: '30px', height: '30px' }}
            />
              {" "}qnfja
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