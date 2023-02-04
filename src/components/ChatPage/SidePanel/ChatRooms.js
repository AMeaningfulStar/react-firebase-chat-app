import React, { Component } from "react";
import { FaRegSmileWink, FaPlus } from 'react-icons/fa';
import { Button, Modal, Form, Badge } from "react-bootstrap";
import { connect } from "react-redux";
import { setCurrentChatRoom, setPrivateChatRoom } from '../../../redux/actions/chatRoom_action';

import { child, getDatabase, onChildAdded, push, ref, update , off, onValue } from "firebase/database";

export class ChatRooms extends Component {
  // ChatRooms 컴포넌트에서 사용되는 데이터의 저장 변수
  state = {
    show: false,
    name: '',
    description: '',
    chatRoomsRef: ref(getDatabase(), 'chatRooms'),
    messagesRef: ref(getDatabase(), 'messages'),
    chatRooms: [],
    firstLoad: true,
    activeChatRoomId: '',
    notifications: []
  }

  componentDidMount() {
    this.AddChatRoomsListeners();
  }

  componentWillUnmount() {
    off(this.state.chatRoomsRef);

    this.state.chatRooms.forEach((chatRoom) => {
      off(child(this.state.messagesRef, chatRoom.id));
    })
  }

  setFirstChatRoom = () => {
    const firstChatRoom = this.state.chatRooms[0];

    if(this.state.firstLoad && this.state.chatRooms.length > 0) {
      this.props.dispatch(setCurrentChatRoom(firstChatRoom));
      this.setState({ activeChatRoomId: firstChatRoom.id });
    }

    this.setState({ firstLoad: false });
  }

  AddChatRoomsListeners = () => {
    let chatRoomsArray = [];

    onChildAdded(this.state.chatRoomsRef, (DataSnapshot) => {
      chatRoomsArray.push(DataSnapshot.val());
      this.setState({ chatRooms: chatRoomsArray },
        () => this.setFirstChatRoom()
      );
      this.addNotificationListener(DataSnapshot.key);
    })
  }

  addNotificationListener = (chatRoomId) => {
    let { messagesRef } = this.state;

    onValue(child(messagesRef, chatRoomId), (DataSnapshot) => {
      if(this.props.chatRoom) {
        this.handleNotification(chatRoomId, this.props.chatRoom.id, this.state.notifications, DataSnapshot);
      }
    })
  }

  handleNotification = (chatRoomId, currentChatRoomId, notifications, DataSnapshot) => {
    let lastTotal = 0;

    // 이미 notifications state 안에 알림 정보가 들어있는 채팅방과 그렇지 않은 채팅방으로 나누기
    // findIndex 함수는 주어진 판별식에 만족하는 요소가 없으면 -1을 반환한다
    let index = notifications.findIndex((notification) => notification.id === chatRoomId);

    // notifications state 안에 해당 채팅방의 알림 정보가 없을 때
    if(index === -1) {
      // id: 채팅방 아이디
      // total: 해당 채팅방의 전체 메세지
      // lastKnownTotal: 이전에 확인한 전체 메세지 개수
      // count: 알림으로 사용될 숫자
      notifications.push({
        id: chatRoomId,
        total: DataSnapshot.size,
        lastKnownTotal: DataSnapshot.size,
        count: 0
      })
    }
    // 이미 해당 채팅방의 알림 정보가 있을 때
    else {
      // 상대방이 채팅 보내는 채팅방이 현재 있는 채팅방이 아닐 때
      if(chatRoomId !== currentChatRoomId) {
        lastTotal = notifications[index].lastKnownTotal

        // count 구하기
        // 채팅방에 있는 총 메세지 개수 - 확인한 총 메세지 > 0
        if(DataSnapshot.size - lastTotal > 0) {
          notifications[index].count = DataSnapshot.size - lastTotal;
        }
      }
      // total property에 채팅방에 있는 총 메세지 개수를 넣어주기
      notifications[index].total = DataSnapshot.size;
    }
    this.setState({ notifications });
  }

  // 모달창의 노출 여부를 결정하는 함수(handleClose, handleShow)
  handleClose = () => this.setState({ show: false });
  handleShow = () => this.setState({ show: true });

  // 방 생성 버튼 클릭 이벤트 함수
  handleSubmit = (event) => {
    event.preventDefault();
    const { name, description } = this.state;

    if(this.isFormValid(name, description)) {
      this.addChatRoom();
    }
  }

  // 방 생성 함수
  addChatRoom = async() => {
    const key = push(this.state.chatRoomsRef).key;
    const { name, description } = this. state;
    const { user } = this.props;

    const newChatRooms = {
      id : key,
      name: name,
      description: description,
      createdBy: {
        name: user.displayName,
        image: user.photoURL
      }
    };

    try{
      await update(child(this.state.chatRoomsRef, key), newChatRooms);

      this.setState({
        name: '',
        description: '',
        show: false
      })
    }
    catch (error) {
      alert(error);
    }
  }

  // 방 생성 시 방의 이름과 설명을 입력했는지 검사하는 함수
  isFormValid = (name, description) => name && description;

  // 생성된 ChatRoom 목록에서 선택 시 동작하는 이벤트 함수
  changeChatRoom = (room) => {
    this.props.dispatch(setCurrentChatRoom(room));
    this.props.dispatch(setPrivateChatRoom(false));
    this.setState({ activeChatRoomId: room.id });
    this.clearNotifications();
  }

  clearNotifications = () => {
    let index = this.state.notifications.findIndex(
      notification => notification.id === this.props.chatRoom.id
    )

    if(index !== -1) {
      let updateNotifications = [...this.state.notifications];

      updateNotifications[index].lastKnownTotal = this.state.notifications[index].total;
      updateNotifications[index].count = 0;
      this.setState({ notifications: updateNotifications });
    }
  }

  // 알림으로 보여줄 count 구하는 함수
  getNotificationCount = (room) => {
    let count = 0;

    this.state.notifications.forEach((notification) => {
      if(notification.id === room.id) {
        count = notification.count;
      }
    });

    if(count > 0) return count;
  }

  renderChatRooms = (chatRooms) => {
    if(chatRooms.length > 0) {
      return chatRooms.map((room) => (
        <li
          key={ room.id }
          style={{ backgroundColor: room.id === this.state.activeChatRoomId && '#ffffff45'}}
          onClick={() => this.changeChatRoom(room)}
        >
          # { room.name }
          <Badge style={{ float: 'right', marginTop: '3px' }} bg='danger'>
            { this.getNotificationCount(room) }
          </Badge>
        </li>
      ))
    }
  }

  render() {
    return (
      <div>
        <div 
          style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center'}}
        >
          <FaRegSmileWink style={{ marginRight: 3 }} />
          CHAT ROOMS {" "} ({ this.state.chatRooms.length })
          <FaPlus
            onClick={this.handleShow}
            style={{ position: 'absolute', right: 0, cursor: 'pointer' }}
          />
        </div>
        
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          { this.renderChatRooms(this.state.chatRooms) }
        </ul>

        {/* ADD CHAT ROOM MODAL */}
        <Modal show={this.state.show} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Create a chat room</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={this.handleSubmit}>
              <Form.Group controlId="formBasicEmail">
                <Form.Label>Chat room name</Form.Label>
                <Form.Control
                  onChange={(event) => this.setState({ name: event.target.value })}
                  type="text"
                  placeholder="Enter a chat room name"
                />
              </Form.Group>

              <Form.Group controlId="formBasicPassword">
                <Form.Label>Chat room description</Form.Label>
                <Form.Control
                  onChange={(event) => this.setState({ description: event.target.value })}
                  type="text"
                  placeholder="Enter a chat room description"
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.handleClose}>
              Close
            </Button>
            <Button variant="primary" onClick={this.handleSubmit}>
              New Chat Room
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.user.currentUser,
    chatRoom: state.chatRoom.currentChatRoom
  }
}

export default connect(mapStateToProps)(ChatRooms)

// const ChatRooms = () => {
//   // ChatRooms 컴포넌트에서 사용되는 데이터의 저장 변수
//   const [ show, setShow ] = useState(false);
//   const [ name, setName ] = useState('');
//   const [ description, setDescription ] = useState('');
//   const [ chatRooms, setChatRooms ] = useState([]);
//   const [ activeChatRoomId, setActiveChatRoomId ] = useState('');
//   const [ firstLoad, setFirstLoad ] = useState(true);
//   const [ notifications, setNotifications ] = useState([]);

//   const chatRoomsRef = ref(getDatabase(), 'chatRooms');
//   const messagesRef = ref(getDatabase(), 'messages');
  
//   const user = useSelector((state) => state.user.currentUser);
//   const chatRoom = useSelector((state) => state.chatRoom.currentChatRoom);
//   const dispatch = useDispatch();

//   // 모달창의 노출 여부를 결정하는 함수(handleClose, handleShow)
//   const handleClose = () => setShow(false);
//   const handleShow = () => setShow(true);

//   // 방 생성 버튼 클릭 이벤트 함수
//   const handleSubmit = (event) => {
//     event.preventDefault()

//     if(isFormValid(name, description)) {
//       addChatRoom();
//     }
//   }

//   // 방 생성 시 방의 이름과 설명을 입력했는지 검사하는 함수
//   const isFormValid = (name, description) => name && description;
  
//   // 방 생성 함수
//   const addChatRoom = async() => {
//     const key = push(chatRoomsRef).key;
//     const newChatRooms = {
//       id : key,
//       name: name,
//       description: description,
//       createdBy: {
//         name: user.displayName,
//         image: user.photoURL
//       }
//     }

//     try{
//       await update(child(chatRoomsRef, key), newChatRooms);

//       setName('');
//       setDescription('');
//       setShow(false);
//     }
//     catch (error) {
//       alert(error);
//     }
//   }

//   // ChatRoom들의 생성되었는지 감시하는 역할
//   useEffect(() => {
//     AddChatRoomsListeners();

//     return () => off(chatRoomsRef);
//   },[]);

//   // ChatRoom 생성되었을 시 동작하는 함수
//   const AddChatRoomsListeners = () => {
//     let chatRoomsArray = [];
    
//     onChildAdded(chatRoomsRef, (DataSnapshot) => {
//       chatRoomsArray.push(DataSnapshot.val());
//       setChatRooms(chatRoomsArray);
//       setFirstChatRoom(chatRoomsArray);
//       addNotificationListener(DataSnapshot.key);
//     })
//   }

//   // notifications의 변화를 감시하는 함수
//   const addNotificationListener = (chatRoomId) => {
//     onValue(child(messagesRef, chatRoomId), (DataSnapshot) => {
//       if(chatRoom) {
//         handleNotification(chatRoomId, chatRoom.id, notifications, DataSnapshot);
//       }
//     })
//   }

//   const handleNotification =(chatRoomId, currentChatRoomId, notifications, DataSnapshot) => {
//     let lastTotal = 0;
//     // 이미 notifications state 안에 알림 정보가 들어있는 채팅방과 그렇지 않은 채팅방으로 나누기
//     // findIndex 함수는 주어진 판별식에 만족하는 요소가 없으면 -1을 반환한다
//     let index = notifications.findIndex((notification) => notification.id === chatRoomId);

//     // notifications state 안에 해당 채팅방의 알림 정보가 없을 때
//     if(index === -1) {
//       // id: 채팅방 아이디
//       // total: 해당 채팅방의 전체 메세지
//       // lastKnownTotal: 이전에 확인한 전체 메세지 개수
//       // count: 알림으로 사용될 숫자
//       notifications.push({
//         id: chatRoomId,
//         total: DataSnapshot.size,
//         lastKnownTotal: DataSnapshot.size,
//         count: 0
//       })
//     }
//     // 이미 해당 채팅방의 알림 정보가 있을 때
//     else {
//       // 상대방이 채팅 보내는 채팅방이 현재 있는 채팅방이 아닐 때
//       if(chatRoomId !== currentChatRoomId) {
//         lastTotal = notifications[index].lastKnownTotal

//         // count 구하기
//         // 채팅방에 있는 총 메세지 개수 - 확인한 총 메세지 > 0
//         if(DataSnapshot.size - lastTotal > 0) {
//           notifications[index].count = DataSnapshot.size - lastTotal;
//         }
//       }
//       // total property에 채팅방에 있는 총 메세지 개수를 넣어주기
//       notifications[index].total = DataSnapshot.size;
//     }
//     setNotifications(notifications);
//   }

//   // 생성된 ChatRoom을 UI에 나타내는 함수
//   const renderChatRooms = (chatRooms, notifications) => {
//     if(chatRooms.length > 0){
//       return chatRooms.map((room) => (
//         <li
//           key={ room.id }
//           style={{ backgroundColor: room.id === activeChatRoomId && '#ffffff45'}}
//           onClick={() => changeChatRoom(room)}
//         >
//           # { room.name }
//           <Badge style={{ float: 'right', marginTop: '3px' }} bg='danger'>
//             { getNotificationCount(room) }
//           </Badge>
//         </li>
//       ))
//     }
//   }

//   // 알림으로 보여줄 count 구하는 함수
//   const getNotificationCount = (room) => {
//     const count = notifications.filter((notification) => notification.id === room.id)[0].count;
//     // notifications.forEach((notification) => {
//     //   if(notification.id === room.id) {
//     //     count = notification.count;
//     //   }
//     // })

//     console.log(count)

//     if(count > 0) {
//       return count;
//     }
//   }

//   // 생성된 ChatRoom 목록에서 선택 시 동작하는 이벤트 함수
//   const changeChatRoom = (room) => {
//     dispatch(setCurrentChatRoom(room));
//     dispatch(setPrivateChatRoom(false));
//     setActiveChatRoomId(room.id);
//   }

//   // 화면이 처음 렌더링 될 시 ChatRoom 중 처음 ChatRoom이 선택되어 있도록 하는 함수
//   const setFirstChatRoom = (chatRooms) => {
//     const firstChatRoom = chatRooms[0];

//     if(firstLoad && chatRooms.length > 0){
//       dispatch(setCurrentChatRoom(firstChatRoom));
//       setActiveChatRoomId(firstChatRoom.id);
//     }

//     setFirstLoad(false);
//   }

//   return(
//     <div>
//       <div 
//         style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center'}}
//       >
//         <FaRegSmileWink style={{ marginRight: 3 }} />
//         CHAT ROOMS {" "}
//         <FaPlus
//           onClick={handleShow}
//           style={{ position: 'absolute', right: 0, cursor: 'pointer' }}
//         />
//       </div>
      
//       <ul style={{ listStyleType: 'none', padding: 0 }}>
//         { renderChatRooms(chatRooms, notifications) }
//       </ul>

//       {/* ADD CHAT ROOM MODAL */}
//       <Modal show={show} onHide={handleClose}>
//         <Modal.Header closeButton>
//           <Modal.Title>Create a chat room</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form onSubmit={handleSubmit}>
//             <Form.Group controlId="formBasicEmail">
//               <Form.Label>Chat room name</Form.Label>
//               <Form.Control
//                 onChange={(event) => setName(event.target.value)}
//                 type="text"
//                 placeholder="Enter a chat room name"
//               />
//             </Form.Group>

//             <Form.Group controlId="formBasicPassword">
//               <Form.Label>Chat room description</Form.Label>
//               <Form.Control
//                 onChange={(event) => setDescription(event.target.value)}
//                 type="text"
//                 placeholder="Enter a chat room description"
//               />
//             </Form.Group>
//           </Form>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={handleClose}>
//             Close
//           </Button>
//           <Button variant="primary" onClick={handleSubmit}>
//             New Chat Room
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   )
// }

// export default ChatRooms