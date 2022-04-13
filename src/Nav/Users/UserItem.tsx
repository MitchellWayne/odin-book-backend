import { useState } from 'react';

import {ReactComponent as Profile} from '../../icons/person_black_24dp.svg';
import {ReactComponent as AddFriend} from '../../icons/person_add_black_24dp.svg';
import { reloadUser } from '../../helpers/userAPI';

function UserItem(props: any) {
  const { user, currentUser } = props;
  const [uiadd, setUiadd] = useState('UserItem__add');
  const [uireqstatus, setUireqstatus] = useState('UserItem__reqStatus--hidden');

  const reqExists = (id: string) => {
    let reqList = currentUser.requested ? currentUser.requested : [];
    if (reqList.includes(id)) return true;
    else return false;
  }

  const areFriends = (id: string) => {
    let friendlist = currentUser.friends ? currentUser.friends : [];
    if (friendlist.includes(id)) return true;
    // Additional case to exclude self
    if (currentUser._id === id) return true;
    else return false;
  }

  const friendReq = async (id: string) => {
    if (!areFriends(id)) {
      let urlParams = new URLSearchParams();
      urlParams.append('friendID', id);

      try {
        let response = await fetch(`/users/${currentUser._id}/requests`, {
          method: "POST",
          body: urlParams,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          credentials: "include",
        });

        const parsedResponse = await response.json();
        console.log(parsedResponse);

        if (response.status === 200) {
          console.log("Successful friend req post")
          setUiadd('UserItem__add--hidden');
          setUireqstatus('UserItem__reqStatus');
          reloadUser(currentUser, true);
        } else {
          console.log("Error on friend request post")
        }
      } catch(err) {
        console.log("Error on friendReq API Call block");
      }
    } else {
      console.log("Cannot be friends w/ existing friends or self");
    }
  }

  return (
    <li className="UserItem">
      <span className="UserItem__primaryInfo">
        {
          user.pfpURL ?
          <div className="UserItem__pfp">
            <img className="profileIcon profileIcon--pfp" alt="user pfp"
              src={`/users/${user._id}/pfpS3/${user.pfpURL}`}>  
            </img>
          </div>
          :
          <div className="UserItem__pfp"><Profile className="profileIcon"/></div>
        }
        <div className="UserItem__fullname">
          {`${user.firstname} ${user.lastname}`}
        </div>
      </span>
      <span className="UserItem__secondaryInfo">
        {
          !areFriends(user._id) && !reqExists(user._id) ?
          <span>
            <button className={uiadd} onClick={() => friendReq(user._id)}><AddFriend className="UserItem__add--Icon"/></button>
            <div className={uireqstatus}>Request sent!</div>
          </span>
          :
          null
        }
        {
          !areFriends(user._id) && reqExists(user._id) ?
          <div className="UserItem__reqStatus">Pending...</div>
          :
          null
        }
      </span>
    </li>
  )
}

export default UserItem;