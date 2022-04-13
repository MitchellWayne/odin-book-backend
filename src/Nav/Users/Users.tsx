import './Users.scss';
import { useEffect, useState } from 'react';
import { User } from '../../interfaces/User';
import UserItem from './UserItem';

function Users(props: any) {
  const { currentUser, setUi } = props;
  const [searchInput, setSearchInput] = useState('');
  const [userlist, setUserlist] = useState<User[]>([]);

  useEffect(() => {
    const findUsers = async () => {
      setUserlist([]);
      try {
        let response = 
          await fetch(`/users?namefilter=${searchInput.toLowerCase()}`, 
          {
            method: "GET",
            credentials: "include",
          });

        const parsedResponse = await response.json();
  
        if(response.status === 200) {
          parsedResponse.forEach((userObj: User) => {
            setUserlist((userlist) => [...userlist, userObj]);
          });
        } else {
          console.log("Error on GET users");
        }
      } catch {
        console.log("Error on try GET users");
      }

    };
    findUsers();
  }, [searchInput]);

  return (
    <div className="Users">
      <div className='Users__return'>
        <button onClick={() => {setUi('default')}}>Back</button>
      </div>
      <div className="Users__search">
        <input onChange={e => setSearchInput(e.target.value)} type="text" name="users" id="users" placeholder='Search for users'/>
      </div>
      <hr className="Users__separator"></hr>
      <ul className="Users__searchResults">
      {
        userlist.map((user: User, i) => {
          if (user._id !== currentUser._id) {
            return (<UserItem user={user} currentUser={currentUser} key={i}/>)
          } else {
            return null;
          }
        })
      }
      </ul>
    </div>
  )
}

export default Users;