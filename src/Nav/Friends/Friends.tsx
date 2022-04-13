import './Friends.scss';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { store } from '../../app/store';
import { setFeed } from '../../features/feedSlice';

import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../app/store';
import { setNav } from '../../features/navSlice';

import {ReactComponent as Profile} from '../../icons/person_black_24dp.svg';
import { User } from '../../interfaces/User';
import { reloadUser } from '../../helpers/userAPI';

function Friends(props: any) {
  const nav: boolean = useSelector((state: RootState) => state.nav.value);
  const dispatch = useDispatch();

  const handleNavToggle = () => {
    dispatch(setNav(!nav));
  };

  const { user, setUi } = props;
  const [reqList, setReqList] = useState<User[]>([]);
  const [friendList, setFriendList] = useState<User[]>([]);
  const [visibleFriendList, setVisibleFriendList] = useState<User[]>([]);

  const filterList = (nameFilter: string) => {
    setVisibleFriendList([]);
    if (nameFilter === '') {
      setVisibleFriendList([...friendList]);
      store.dispatch(setFeed({isFiltered: false, filter: ''}));
    }
    else {
      setVisibleFriendList([]);
      store.dispatch(setFeed({isFiltered: true, filter: nameFilter}));

      friendList.forEach((friend: User) => {
        let fullname = friend.firstname + ' ' + friend.lastname;
        fullname = fullname.toLowerCase();
        if (fullname.includes(nameFilter.toLowerCase())) {
          setVisibleFriendList((visibleFriendList) => [...visibleFriendList, friend]);
        }
      });
    }
  };

  const handleFriendRequest = async (userID: string, option: boolean) => {
    let urlParams = new URLSearchParams();
    urlParams.append('friendID', userID);

    // option true = POST, otherwise DELETE
    try {
      if (option) {
        let response = await fetch(`/users/${user._id}/friends`, {
          method: "POST",
          body: urlParams,
          credentials: "include",
        });

        if(response.status === 200) {
          reloadUser(user, true);
        } else {
          console.log("Error on GET by user id");
        }
      } else {
        let response = await fetch(`/users/${user._id}/requests`, {
          method: "DELETE",
          body: urlParams,
          credentials: "include",
        });

        if(response.status === 200) {
          reloadUser(user, true);
        } else {
          console.log("Error on GET by user id");
        }
      }
    } catch {
      console.log("Error on GET by user id block");
    }
  };

  const delFriend = async (userID: string) => {
    let urlParams = new URLSearchParams();
    urlParams.append('friendID', userID);

    try {
      let response = await fetch(`/users/${user._id}/friends`, {
        method: "DELETE",
        body: urlParams,
        credentials: "include",
      });

      if (response.status === 200) {
        reloadUser(user, true);
      } else {
        console.log('Err on DEL Friend')
      }
    } catch (err) {
      console.log('Err on try delFriend');
      console.log(err);
    }
  }

  useEffect(() => {
    const getReqs = () => {
      if (user) {
        setReqList([]);
        let reqIDs = user.requests;
        reqIDs.forEach(async (userID: string) => {
          try {
            let response = 
            await fetch(`/users/${userID}`, 
            {
              method: "GET",
              credentials: "include",
            });
    
            const parsedResponse = await response.json();
      
            if(response.status === 200) {
              setReqList((reqList) => [...reqList, parsedResponse]);
            } else {
              console.log("Error on GET users");
            }
          } catch (err) {
            console.log("Error on try GET users")
          }
        });
      }
    };

    const getFriends = () => {
      if (user) {
        setFriendList([]);
        setVisibleFriendList([]);
        let friendIDs = user.friends;
        friendIDs.forEach(async (userID: string) => {
          try {
            let response = 
            await fetch(`/users/${userID}`, 
            {
              method: "GET",
              credentials: "include",
            });
    
            const parsedResponse = await response.json();
      
            if(response.status === 200) {
              setFriendList((friendList) => [...friendList, parsedResponse]);
              setVisibleFriendList((friendList) => [...friendList, parsedResponse]);
            } else {
              console.log("Error on GET users");
            }
          } catch (err) {
            console.log("Error on try GET users")
          }
        });
      }
    };
    getReqs();
    getFriends();
  }, [user]);

  return (
    <div className="FriendList">
      <div className="FriendList__return">
        <button onClick={() => {setUi('default')}}>Back</button>
      </div>
      {
        reqList.length > 0 ?
        <div className="FriendList__requests">
          <hr className="FriendList__requestsSeparator"></hr>
          <ul className="FriendList__requestsList">
            {
              reqList ?
              reqList.map((item: User, i ) => 
              <li key={i}>
                <div className="FriendItem">
                  <span className="FriendItem__primaryInfo">
                  {
                    item.pfpURL ?
                    <div className="FriendItem__pfp">
                      <img className="profileIcon profileIcon--pfp" alt="user pfp"
                        src={`/users/${item._id}/pfpS3/${item.pfpURL}`}>  
                      </img>
                    </div>
                    :
                    <div className="FriendItem__pfp"><Profile className="profileIcon"/></div>
                  }
                    <div className="FriendItem__fullname">{`${item.firstname} ${item.lastname}`}</div>
                  </span>
                  <span className="FriendItem__secondaryInfo">
                    <div className="FriendItem__opts">
                      <button className="FriendItem__yes" onClick={() => handleFriendRequest(item._id, true)}>Y</button>
                      <button className="FriendItem__no" onClick={() => handleFriendRequest(item._id, false)}>N</button>
                    </div>
                  </span>
                </div>
              </li>
              )
              :
              null
            }
          </ul>
        </div>
        :
        null
      }

      <hr className="FriendList__friendsSeparator"></hr>
      <div className="FriendList__search">
        <input onChange={e => filterList(e.target.value)}className="FriendList__searchInput" type="text" placeholder="Search friends"/>
      </div>
      <div className="FriendList__friends">
      <ul className="FriendList__friendsList">
          {
            visibleFriendList ?
            visibleFriendList.map((item: User, i ) => 
            <li key={i}>
              <div className="FriendItem">
                <span className="FriendItem__primaryInfo">
                  {
                    item.pfpURL ?
                    <div className="FriendItem__pfp">
                      <img className="profileIcon profileIcon--pfp" alt="user pfp"
                        src={`/users/${item._id}/pfpS3/${item.pfpURL}`}>  
                      </img>
                    </div>
                    :
                    <div className="FriendItem__pfp"><Profile className="profileIcon"/></div>
                  }
                  <Link
                    className="FriendItem__fullname"
                    to="/profile"
                    state={{id: item._id}}
                    onClick={() => handleNavToggle()}
                  >
                    {`${item.firstname} ${item.lastname}`}
                  </Link>
                </span>
                <span className="FriendItem__secondaryInfo">
                  <button className="FriendItem__unfriend" onClick={() => delFriend(item._id)}>x</button>
                </span>
              </div>
            </li>
            )
            :
            null
          }
      </ul>
      </div>
    </div>
  )
}

export default Friends;