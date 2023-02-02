import React, { useEffect, useState } from "react";
import { FaRegSmile } from 'react-icons/fa';
import { useSelector } from "react-redux";

import { getDatabase, ref, onChildAdded, onValue } from 'firebase/database';

const DirectMessages = () => {
  const user = useSelector((state) => state.user.currentUer);
  const usersRef = ref(getDatabase(), 'users');

  const [ users, setUsers ] = useState([]);
  const [ activeChatRoom, setActiveChatRoom ] = useState('');

  useEffect(()=> {
    if(user){
      onValue(usersRef, ()=> {
        addUsersListeners(user.uid);
      })
    }
  }, []);

  const renderDirectMessages = (users) => {
    if(users.length > 0){
      return users.map((user) => (
        <li
          key={user.uid}
          >
          # { user.name }
        </li>
      ))
    }
  }

  const addUsersListeners = (currentUserId) => {
    let usersArray = [];

    onChildAdded(usersRef, (DataSnapshot) => {
      if(currentUserId !== DataSnapshot.key){
        let user = DataSnapshot.val();
        user['uid'] = DataSnapshot.key;
        user['status'] = 'offline';
        usersArray.push(user);
        setUsers(usersArray);
      }
    })
  }

  return(
    <div>
      <span style={{ display: 'flex', alignItems: 'center' }}>
        <FaRegSmile style={{ marginRight: 3 }} /> DIRECT MESSAGES(1)
      </span>

      <ul style={{ listStyleType: 'none', padding: 0 }}>
        { renderDirectMessages(users) }
      </ul>
    </div>
  )
}

export default DirectMessages