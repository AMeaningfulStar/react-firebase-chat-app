import React, { useEffect, useState } from "react";
import MessageHeader from "./MessageHeader";
import Message from "./Message";
import MessageForm from "./MessageForm";
import { useSelector } from "react-redux";
import { child, getDatabase, onChildAdded, ref , onValue } from "firebase/database";

const MainPanel = () => {
  const [ messages, setMessages ] = useState([]);
  const [ messagesLoading, setMessagesLoading ] = useState(true);
  const [ searchTerm, setSearchTerm ] = useState("");
  const [ searchResults, setSearchResults ] = useState([]);
  const [ searchLoading, setSearchLoading ] = useState(false);

  const messagesRef = ref(getDatabase(), 'messages');

  const chatRoom = useSelector((state) => state.chatRoom.currentChatRoom);
  const user = useSelector((state) => state.user.currentUser);
  
  useEffect(()=>{
    if (chatRoom !== null) {
      onValue(messagesRef, () => {
        addMessagesListeners(chatRoom.id);
      })
    }
  },[]);

  const addMessagesListeners = (chatRoomId) => {
    let messagesArray = [];
    
    onChildAdded(child(messagesRef, chatRoomId), (DataSnapshot)=> {
      messagesArray.push(DataSnapshot.val());

      setMessages(messagesArray);
      setMessagesLoading(false);
    })
  }

  const renderMessages = (messages) => {
    if(messages.length > 0){
      return messages.map((message) => (
        <Message
          key={ message.timestamp }
          message={ message }
          user={ user }
        />
      ));
    }
  }

  const handleSearchMessages = () => {
    const chatRoomMessages = [...messages];
    const regex = new RegExp(searchTerm, 'gi');
    const searchResults = chatRoomMessages.reduce((acc, message) => {
      if((message.content && message.content.match(regex)) || message.user.name.match(regex)){
        acc.push(message);
      }

      return acc;
    }, []);
    setSearchResults(searchResults);
  }

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setSearchLoading(true);
    handleSearchMessages();
  }

  return(
    <div style={{ padding: '2rem 2rem 0 2rem' }}>
      <MessageHeader handleSearchChange={ handleSearchChange }/>
      <div style={{
          width: '100%',
          height: '450px',
          border: '.2rem solid #ececec',
          borderRadius: '4px',
          padding: '1rem',
          marginBottom: '1rem',
          overflowY: 'auto'
        }}
      >
        { searchTerm ? renderMessages(searchResults) : renderMessages(messages)}
      </div>

      <MessageForm />
    </div>
  )
}

export default MainPanel
