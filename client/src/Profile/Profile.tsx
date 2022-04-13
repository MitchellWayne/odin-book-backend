import './Profile.scss';
import '../Feed/Feed.scss';
import { ChangeEvent, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../app/store';
import { useLocation } from 'react-router-dom';

import { User } from '../interfaces/User';
import { Post } from '../interfaces/Post';
import { reloadUser } from '../helpers/userAPI';
import FeedItem from '../FeedItem';
import EditItem from '../EditItem';

type LocationState = { id: string };

function Profile(props: any) {
  const user: User = useSelector((state: RootState) => state.user.value as User);
  const nav: boolean = useSelector((state: RootState) => state.nav.value);

  // id holds target user._id
  const location = useLocation();
  const { id } = location.state as LocationState;

  const [postList, setPostList] = useState<Post[]>([]);
  const [targetUser, setTargetUser] = useState<User>();
  const [userAbout, setUserAbout] = useState<string>(targetUser ? targetUser.about : '');
  const [editingabout, setEditingabout] = useState(false);

  // Reload User from cookie
  useEffect(() => {
    reloadUser(user);
  }, [user]);

  const toggleEditingabout = () => {
    setEditingabout(!editingabout);
  };

  useEffect(() => {
    const populateFeedList = async () => {      
      if (id !== null) {
        setPostList([]);
        try {
          let response = await fetch(`/users/${id}/posts`, {
            method: "GET",
            credentials: "include",
          });

          const userPostList = await response.json();
          userPostList.forEach((postObj: Post) => {
            setPostList((postList) => [...postList, postObj]
            .sort(function(a,b){
              return new Date(b.timestamp).valueOf() - new Date(a.timestamp).valueOf();
            }));
          });
        } catch (err){
          console.log("Failed to get postlist by userID")
        }
      }
    };  

    const getUserInfo = async () => {
      try {
        let response = await fetch(`/users/${id}`, {
          method: "GET",
          credentials: "include",
        });
        const parsedResponse = await response.json();
  
        if(response.status === 200) {
          setTargetUser(parsedResponse);
        } else {
          console.log("Error on GET by user id")
        }
      } catch {
        console.log("Error on GET by user id block")
      }
    };

    populateFeedList();
    getUserInfo();
  }, [id]);

  const handleUpdateAbout = async () => {
    if (userAbout) {
      let urlParams = new URLSearchParams();
      urlParams.append('firstname', user.firstname);
      urlParams.append('lastname', user.lastname);
      urlParams.append('username', user.username);
      urlParams.append('about', userAbout);

      try {
        let response = await fetch(`/users/${user._id}`, {
          method: "PUT",
          body: urlParams,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          credentials: "include",
        });

        const parsedResponse = await response.json();

        if (response.status !== 201) {
          console.log(parsedResponse);
        } else {
          toggleEditingabout();
        }
        
      } catch (err) {
        console.log(err);
      }
    }
  };

  const handlePfpUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    console.log("New file detected!");
    console.log(event.target.files);

    if (event.target.files) {
      // Upload via Express API endpoint
      const formData = new FormData();
      formData.append("pfp", event.target.files[0]);

      let response = await fetch(`/users/${user._id}/pfpS3`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const parsedResponse = await response.json();

      if (response.status !== 201) {
        console.log(parsedResponse);
      } else {
        console.log(parsedResponse);
        reloadUser(user, true);
      }
    }
  };

  useEffect(() => {
    setUserAbout(targetUser ? targetUser.about : '');
  }, [targetUser])

  // useEffect(() => {
  //   console.log(targetUser);
  //   console.log(postList);
  // }, [postList, targetUser]);

  
  return (
    <div className="Profile">
      <div className={`UserInfo ${nav ? "UserInfo--hidden" : ""}`}>
        <div className="UserInfo__profIcon">
          {
            targetUser && targetUser.pfpURL ? 
            <label htmlFor="pfpupload">
              <img
                className={`UserInfo__icon ${targetUser._id === user._id ? 'UserInfo__icon--pfp' : ""}`}
                alt="user pfp"
                src={`/users/${targetUser._id}/pfpS3/${targetUser.pfpURL}`}
              >
              </img>
              {
                targetUser._id === user._id ? 
                <input className="UserInfo__pfpUpload" type="file" id="pfpupload" 
                  accept=".jpeg, .jpg, .png"
                  onChange={e => handlePfpUpload(e)}
                />
                :
                null
              } 
            </label>
            :
            <>
            {
              targetUser && !targetUser.pfpURL ?
              <label htmlFor="pfpupload">
              <Profile className={`UserInfo__icon ${targetUser._id === user._id ? 'UserInfo__icon--pfp' : ""}`}/>
              {
                targetUser._id === user._id ? 
                <input className="UserInfo__pfpUpload" type="file" id="pfpupload" 
                  accept=".jpeg, .jpg, .png"
                  onChange={e => handlePfpUpload(e)}
                />
                :
                null
              } 
            </label>
              :
              null
            }
            </>
          }
        </div>
        <div className="UserInfo__about">
          {
            !editingabout ?
            <span>
              {
                user ?
                <span>{userAbout ? userAbout : "No additional information about this user."}</span>
                :
                <span>
                  No additional information about this user.
                </span>
              }
            </span>
            :
            <span>
              {
                targetUser ?
                <textarea className="UserInfo__about--editing" value={userAbout} onChange={e => setUserAbout(e.target.value)}></textarea>
                :
                null
              }
            </span>
          }    
          {
            targetUser?._id === user._id ? 
            <span>
              <hr className="separator"></hr>
                { 
                  editingabout ?
                  <button className="UserInfo__editBtn" onClick={handleUpdateAbout}>Finish editing</button>
                  :
                  <button className="UserInfo__editBtn" onClick={toggleEditingabout}>Edit About</button>
                }
            </span>
            :
            null
          }
        </div>
      </div>

      <div className={`Feed Feed--profile ${nav ? "Feed--profileNavActive" : ""}`}>
        {
          postList ?
          <>
          {
            targetUser && targetUser._id !== user._id ?
            postList.map((post) =>
            <FeedItem 
              key={post._id}
              userid={user._id}
              post={post}
            />)
            :
            postList.map((post) => 
            <EditItem
              key={post._id}
              userid={user._id}
              post={post}
            />
            )
          }
          </>
          
          :
          null
        }
      </div>
    </div>
  )
}

export default Profile;