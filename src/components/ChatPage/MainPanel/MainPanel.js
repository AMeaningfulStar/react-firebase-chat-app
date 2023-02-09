import React, { useEffect, useState } from "react";
import MessageHeader from "./MessageHeader";
import Message from "./Message";
import MessageForm from "./MessageForm";
import { useSelector, useDispatch } from "react-redux";
import { child, getDatabase, onChildAdded, ref , onValue, off, onChildRemoved } from "firebase/database";
import { setUserPosts } from "../../../redux/actions/chatRoom_action";

const MainPanel = () => {
  const [ messages, setMessages ] = useState([]);
  const [ messagesLoading, setMessagesLoading ] = useState(true);
  const [ searchTerm, setSearchTerm ] = useState("");
  const [ searchResults, setSearchResults ] = useState([]);
  const [ searchLoading, setSearchLoading ] = useState(false);
  const [ typingUsers, setTypingUsers] = useState([]);
  const [ listenerLists, setListenerLists ] = useState([]);
  
  const messageEndRef = React.createRef();

  const messagesRef = ref(getDatabase(), 'messages');
  const typingRef = ref(getDatabase(), 'typing');

  const chatRoom = useSelector((state) => state.chatRoom.currentChatRoom);
  const user = useSelector((state) => state.user.currentUser);
  const dispatch = useDispatch();
  
  useEffect(()=>{
    if (chatRoom !== null) {
      onValue(messagesRef, () => {
        addMessagesListeners(chatRoom.id);
      })
      onValue(typingRef, () => {
        addTypingListeners(chatRoom.id);
      })
    }

    return () => {
      off(messagesRef);
      removeListeners(listenerLists);
    }
  },[]);

  useEffect(() => {
    if(messageEndRef){
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messageEndRef])

  const removeListeners = (listeners) => {
    listeners.forEach((listener) => {
      off(ref(getDatabase(), `messages/${listener.id}`), listener.event);
    })
  }

  const addMessagesListeners = (chatRoomId) => {
    let messagesArray = [];
    
    onChildAdded(child(messagesRef, chatRoomId), (DataSnapshot)=> {
      messagesArray.push(DataSnapshot.val());

      setMessages(messagesArray);
      setMessagesLoading(false);
      userPostsCount(messagesArray);
    })
  }

  const addTypingListeners = (chatRoomId) => {
    let typingUsers = [];

    // 새로운 typing이 들어올 때
    onChildAdded(child(typingRef, chatRoomId), (Datasnapshot) => {
      if (Datasnapshot.key !== user.uid) {
        typingUsers = typingUsers.concat({
          id: Datasnapshot.key,
          name: Datasnapshot.val()
        })

        setTypingUsers(typingUsers);
      }
    })

    // listenerLists state에 등록한 리스너 넣어주기
    addToListenerLists(chatRoomId, typingRef, 'child_added');

    // typing이 지워질 때
    onChildRemoved(child(typingRef, chatRoomId), (DataSnapshot) => {
      const index = typingUsers.findIndex((user) => user.id === DataSnapshot.key);

      if(index !== -1) {
        typingUsers = typingUsers.filter((user) => user.id !== DataSnapshot.key);
        setTypingUsers(typingUsers);
      }
    })

    // listenerLists state에 등록한 리스너 넣어주기
    addToListenerLists(chatRoomId, typingRef, 'child_removed');
  }

  const addToListenerLists = (id, ref, event) => {
    // 이미 등록되어 있는 리스너인지 확인
    const index = listenerLists.findIndex((listener) => {
      return (
        listener.id === id &&
        listener.ref === ref &&
        listener.event === event
      );
    });

    // 만약 등록된 리스너가 아니라면
    if (index === -1) {
      const newListener = { id, ref, event };
      setListenerLists(listenerLists.concat(newListener));
    }
  }

  const userPostsCount = (messages) => {
    let userPosts = messages.reduce((acc, message) => {
      if (message.user.name in acc){
        acc[message.user.name].count += 1;
      } else {
        acc[message.user.name] = {
          image: message.user.image,
          count: 1
        }
      }

      return acc;
    }, {});

    dispatch(setUserPosts(userPosts));
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

  const renderTypingUsers = (typingUsers) => {
    return (typingUsers.length > 0 &&
      typingUsers.map((user) => (
        <span>{ user.name.userUid }님이 채팅을 입력하고 있습니다...</span>
      )))
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
        
        { renderTypingUsers(typingUsers) }

        <div ref={messageEndRef} />
      </div>

      <MessageForm />
    </div>
  )
}

export default MainPanel
