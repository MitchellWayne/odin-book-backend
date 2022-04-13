import '../FeedItem/FeedItem.scss';
import '../CreatePost/CreatePost.scss';

import React, { useState, useEffect } from 'react';
import {ReactComponent as Profile} from '../icons/person_black_24dp.svg';
import {ReactComponent as ThumbUp} from '../icons/thumb_up_black_24dp.svg';

const he = require('he');

function EditItem(props: any){
  const { userid, post } = props;

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(props.post ? props.post.title : '');
  const [text, setText] = useState(props.post ? props.post.text : '');
  const [errormsg, setErrormsg] = useState([]);

  const [likeClass, setLikeClass] = useState("");
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(Array(post.comments.length));
  const [numComments, setNumComments] = useState(post.comments.length);

  const toggleEdit = () => {
    setEditing(!editing);
  };

  const updatePost = async () => {
    let urlParams = new URLSearchParams();
    urlParams.append('title', title);
    urlParams.append('text', text);

    try {
      let response = await fetch(`/users/${userid}/posts/${post._id}`, {
        method: "PUT",
        body: urlParams,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        credentials: "include",
      });

      const parsedResponse = await response.json();
      console.log(parsedResponse);

      if (response.status === 201) {
        // Post Updated
        toggleEdit();
      } else {
        setErrormsg(parsedResponse.err.errors.map((err: any) => err.msg));
      }
    } catch {
      console.log("Error on Post PUT");
    }
  };

  const handleLike = async () => {
    if (!post.likes.includes(userid)) {
      // Handle adding like
      try {
        let response = await fetch(`/users/${userid}/posts/${post._id}/like`, {
          method: "POST",
          credentials: "include",
        });
  
        if(response.status === 200) {
          props.post.likes.push(userid);
          setLikeClass("ThumbUp__container ThumbUp__container--liked");
          console.log("Successfully liked post");
        } else {
          console.log("Error on post like POST");
        }
      } catch {
        console.log("Error on try post like POST");
      }
    } 
    // Handle removing like
    else {
      try {
        let response = await fetch(`/users/${userid}/posts/${props.post._id}/like`, {
          method: "DELETE",
          credentials: "include",
        });
  
        if(response.status === 200) {
          props.post.likes.splice(props.post.likes.indexOf(userid), 1)
          setLikeClass("ThumbUp__container");
          console.log("Successfully unliked post");
        } else {
          console.log("Error on post like DELETE");
        }
      } catch {
        console.log("Error on try post like DELETE");
      }
    }
  };

  const togComments = () => {
    getComments();
    setShowComments(!showComments);
  };

  const createComment = async () => {    
    let urlParams = new URLSearchParams();
    urlParams.append('text', commentText);

    try {
      let response = await fetch(`/users/${userid}/posts/${post._id}/comments`, {
        method: "POST",
        body: urlParams,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        credentials: "include",
      });

      const parsedResponse = await response.json();
      
      if (response.status === 201) {
        console.log("Comment saved");
        getComments();
      } else {
        console.log("Error on comment POST")
        console.log(parsedResponse.err.errors);
      }
    } catch(err) {
      console.log(err);
    }
  };

  const getComments = async () => {
    try {
      let response = await fetch(`/users/${userid}/posts/${post._id}/comments`, {
        method: "GET",
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        credentials: "include",
      });
      
      const parsedResponse = await response.json();

      if (response.status === 200) {
        setComments([]);
        parsedResponse.forEach((commentObj: object) => {
          setComments((comments) => [...comments, commentObj]
          .sort(function(a,b){
            return new Date(b.timestamp).valueOf() - new Date(a.timestamp).valueOf();
          }));
        });
      } else {
        console.log("Error on comments list GET")
      }
    } catch(err) {
      console.log(err);
    }
  };

  const handleSubmitComment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createComment();
  }

  const handleSubmit = () => {
    updatePost();
  };

  useEffect(() => {
    setNumComments(comments.length);
  }, [comments.length]);

  useEffect(() => {
    let calcClass = post.likes.includes(userid) ? "ThumbUp__container ThumbUp__container--liked" : "ThumbUp__container";
    setLikeClass(calcClass);
  }, [post.likes, userid]);

  useEffect(() => {
    if (post) 
     {
       setTitle(post.title);
       setText(post.text);
     }
  }, [post]);

  return (
    <div className="EditItem">
      <span>
        <div className="FeedItem__header">
          <span className="flexWrapper">
            {
              !props.profileItem ?
              <span className="iconWrapper">
                {
                  post.pfpURL ?
                  <div className="FeedItem__profIcon">
                    <img
                      className="FeedItem__icon FeedItem__icon--pfp"
                      alt="user pfp"
                      src={`/users/${post.author}/pfpS3/${post.pfpURL}`}
                    />
                  </div>
                  :
                  <Profile className="FeedItem__icon"/>
                }
              </span>
              :
              null
            }
            <div className="EditItem__author">{post.authorString}</div>
          </span>
          <span className="flexWrapper">
            {
              post.author === userid ?
              <span>
              {
                !editing ?
                <button className="EditItem__editBtn" onClick={toggleEdit}>Edit</button>
                :
                <button className="EditItem__editBtn" onClick={handleSubmit}>Done Editing</button>
              }
              </span>
              :
              null
            }
            <div className="EditItem__timestamp">
              {
                post ?
                new Date(post.timestamp).toLocaleDateString("en-US",
                { hour: '2-digit',
                  hour12: true,
                  minute: '2-digit',
                })
                :
                null
              }
            </div>
          </span>
        </div>
        {
          !editing ?
          <span className="FeedItem__content">
            <div className="FeedItem__title">{he.decode(title)}</div>
            <div className="FeedItem__text">
              {he.decode(text)}
            </div>
          </span>
          :
          <span className="EditItem__content">
            <input className="EditItem__title" value={he.decode(title)} onChange={e => setTitle(e.target.value)}/>
            <textarea className="EditItem__text" rows={5} value={he.decode(text)} onChange={e => setText(e.target.value)}/>
            <ul className="EditItem__formErrors">
              {  
                errormsg.length > 0 ?      
                errormsg.map((error, i) => 
                  <li key={i} className="EditItem__formError">{error}</li>
                )
                :
                null
              }
            </ul>
          </span>
        }
      </span>

      {
        post.imgURL ?
        <div className="FeedItem__imgContainer">
          <img className={`FeedItem__img`} alt="associated post file preview"
            src={`/users/${post.author}/posts/${post._id}/imgS3/${post.imgURL}`}>
          </img>
        </div>
        :
        null
      }

      <div className="FeedItem__stats">
        <div className="FeedItem__likes">
          <button onClick={handleLike} className={likeClass}><ThumbUp className="ThumbUp__svg"/></button>
          {
            props.post.likes.length > 0 ?
            <span className="FeedItem__likeCount"> +{props.post.likes.length} Likes </span>
            :
            null
          }
        </div>
        <div className="FeedItem__isEdited"></div>
      </div>
      <div className="FeedItem__commentList">
        <form className="commentForm" onSubmit={handleSubmitComment}>
          <input className="commentForm__input" type="text" placeholder="New Comment"
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            maxLength={100}
            minLength={1}
          />
          <input className="commentForm__submit" type="submit" value="Publish"/>
        </form>
        <button className="toggleComments" onClick={togComments}>
          {
            showComments ?
            "Hide comments"
            :
            <span>
            {
              numComments > 0 ?
              <span>
              {`Show ${numComments} comments`}
              </span>
              :
              'Comments'
            }
            </span>
            
          }
        </button>
        {
          showComments ? 
          <div className={comments.length > 0 ? "commentList" : ''}>
            {
                comments.length > 0 ?
                comments.map((item, i) => 
                  <div className="comment" key={i}>
                    <div className="sampleComment">
                      <div className="FeedItem__profIcon"><Profile className="FeedItem__icon"/></div>
                      <div className="sampleComment__author">{item.authorString}:</div>
                      <div className="sampleComment__text">{item.text}</div>
                    </div>
                  </div>
                )
                :
                <div className="FeedItem__text">No comments exist. Be the first one to comment!</div>
              }
            </div>
          :
          null
        }
      </div>
    </div>
  )
}

export default EditItem;