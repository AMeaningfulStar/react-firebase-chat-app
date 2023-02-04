import React, { Component } from "react";
import { FaRegSmileWink } from 'react-icons/fa';
import { connect } from "react-redux";
import { child, getDatabase, onChildAdded, onChildRemoved, ref, off } from "firebase/database";
import { setCurrentChatRoom, setPrivateChatRoom } from "../../../redux/actions/chatRoom_action";

export class Favorited extends Component {
  state = {
    favoritedChatRooms: [],
    activeChatRoomId: '',
    userRef: ref(getDatabase(), 'users')
  };

  componentDidMount(){
    if(this.props.user) {
      this.addListeners(this.props.user.uid);
    }
  }

  componentWillUnmount() {
    if(this.props.user) {
      this.removeListener(this.props.user.uid);
    }
  }

  removeListener = (userId) => {
    const { userRef } = this.state;

    off(child(userRef, `${userId}/favorited`));
  }

  addListeners = (userId) => {
    const { userRef } = this.state;

    onChildAdded(child(userRef, `${userId}/favorited`), (DataSnapshot) => {
      const favoritedChatRoom = {
        id: DataSnapshot.key,
        ...DataSnapshot.val()
      }

      this.setState({ favoritedChatRooms: [...this.state.favoritedChatRooms,  favoritedChatRoom]});
    });

    onChildRemoved(child(userRef, `${userId}/favorited`), (DataSnapshot) => {
      const chatRoomToRemove = {
        id: DataSnapshot.key,
        ...DataSnapshot.val()
      };

      const filteredChatRooms = this.state.favoritedChatRooms.filter((chatRoom) => {
        return chatRoom.id !== chatRoomToRemove.id;
      })

      this.setState({ favoritedChatRooms: filteredChatRooms });
    });
  }

  changeChatRoom = (chatRoom) => {
    this.props.dispatch(setCurrentChatRoom(chatRoom));
    this.props.dispatch(setPrivateChatRoom(false));
    this.setState({ activeChatRoomId: chatRoom.id });
  }

  renderFavoritedChatRooms = (favoritedChatRooms) => {
    if(favoritedChatRooms.length > 0) {
      return favoritedChatRooms.map((chatRoom) => (
        <li
          key={ chatRoom.id }
          onClick={() => this.changeChatRoom(chatRoom)}
          style={{ backgroundColor: chatRoom.id === this.state.activeChatRoomId && '#ffffff45' }}
        >
          # { chatRoom.name }
        </li>
      ))
    }
  }

  render(){
    const { favoritedChatRooms } = this.state;

    return(
      <div>
        <span style={{ display: 'flex', alignItems: 'center' }}>
          <FaRegSmileWink style={{ marginRight: '3px'}} />
          FAVORITED ({ favoritedChatRooms.length })
        </span>
        <ul style={{ listStyleType: 'none', padding: '0' }}>
          { this.renderFavoritedChatRooms(favoritedChatRooms) }
        </ul>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.user.currentUser
  }
}

export default connect(mapStateToProps)(Favorited)

// const Favorited = () => {
//   const user = useSelector((state) => state.user.currentUser);
//   const userRef = ref(getDatabase(), 'users');
//   const [ favoritedChatRooms, setFavoritedChatRooms ] = useState([]);
//   const [ activeChatRoomId, setActiveChatRoomId ] = useState('');

//   useEffect(() => {
//     if(user) {
//       addListeners(user.uid);
//     }
//   }, []);

//   const addListeners = (userId) => {
//     let favoritedChatRoomPush = [];

//     onChildAdded(child(userRef, `${userId}/favorited`), (DataSnapshot) => {
//       console.log(`Datasnapshot: ${ DataSnapshot.val() }`);
//       const favoritedChatRoom = {
//         id: DataSnapshot.key,
//         ...DataSnapshot.val()
//       };

//       console.log(`favoritedChatRoom : ${ JSON.stringify(favoritedChatRoom) }`);
//       favoritedChatRoomPush.push([...favoritedChatRooms, favoritedChatRoom]);
//       console.log(`favoritedChatRoomPush: ${ favoritedChatRoomPush }`);
//       // const favoritedChatRoomPush = [...favoritedChatRooms, favoritedChatRoom];
//       // console.log(`id: ${ DataSnapshot.key }`);
//       // console.log(favoritedChatRoomPush)
//       // setFavoritedChatRooms(favoritedChatRoomPush);
//       // console.log(`array: ${ favoritedChatRooms }`);
//     })
//     setFavoritedChatRooms(favoritedChatRoomPush);
    
//     // onChildRemoved(child(userRef, `${userId}/favorited`), (DataSnapshot) => {
//     //   const chatRoomToRemove = {
//     //     id: DataSnapshot.key,
//     //     ...DataSnapshot.val()
//     //   };
//     //   const filteredChatRooms = favoritedChatRooms.filter((chatRoom) => {
//     //       return chatRoom.id !== chatRoomToRemove.id;
//     //   })
//     //     setFavoritedChatRooms(filteredChatRooms);
//     // })
//   }

//   const renderFavoritedChatRooms = (favoritedChatRooms) => {
//     if(favoritedChatRooms.length > 0) {
//       return favoritedChatRooms.map((chatRoom) => (
//         <li
//           key={ chatRoom.id }
//           style={{ backgroundColor: chatRoom.id === activeChatRoomId && '#ffffff45' }}
//         >
//           # { chatRoom.name }
//         </li>
//       ))
//     }
//   }

//   return(
//     <div>
//       <span style={{ display: 'flex', alignItems: 'center' }}>
//         <FaRegSmileWink style={{ marginRight: '3px'}} />
//         FAVORITED
//       </span>
//       <ul style={{ listStyleType: 'none', padding: '0' }}>
//         { renderFavoritedChatRooms(favoritedChatRooms) }
//       </ul>
//     </div>
//   )
// }

// export default Favorited