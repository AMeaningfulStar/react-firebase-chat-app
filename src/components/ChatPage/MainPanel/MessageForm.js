import React from "react";
import { Col, Form, ProgressBar, Row } from "react-bootstrap";

const MessageForm = () => {
  return(
    <div>
      <Form>
        <Form.Group controlId="exampleForm.ControlTextarea1">
          <Form.Control
            as="textarea"
            rows={3}
          />
        </Form.Group>
      </Form>

      <ProgressBar variant="warning" label='60%' now={60} />

      <Row>
        <Col>
          <button
            style={{ width: '100%' }}
            className='message-form-button'          
          >
            SEND
          </button>
        </Col>
        <Col>
          <button
            style={{ width: '100%' }}
            className='message-form-button'          
          >
            UPLOAD
          </button>
        </Col>
      </Row>
    </div>
  )
}

export default MessageForm