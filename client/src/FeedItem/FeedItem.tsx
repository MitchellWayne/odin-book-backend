import './FeedItem.scss';

import {ReactComponent as Profile} from '../icons/person_black_24dp.svg';
import {ReactComponent as ThumbUp} from '../icons/thumb_up_black_24dp.svg';

import { Link } from 'react-router-dom';
import { Post } from '../interfaces/Post';
import { User } from '../interfaces/User';
import { useSelector } from 'react-redux';
import { ReactEventHandler, useEffect, useState } from 'react';
import { RootState } from '../app/store';

const he = require('he');

function FeedItem(props: any) {
  // const user: User = useSelector((state: RootState) => state.user.value as User);
  // const post: Post = props.post;

  const { userid, post } = props;

  const [likeClass, setLikeClass] = useState("");
  const [commentText, setCommentText] = useState("");

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(Array(post.comments.length));
  const [numComments, setNumComments] = useState(post.comments.length);


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

  useEffect(() => {
    setNumComments(comments.length);
  }, [comments.length]);

  useEffect(() => {
    let calcClass = post.likes.includes(userid) ? "ThumbUp__container ThumbUp__container--liked" : "ThumbUp__container";
    setLikeClass(calcClass);
  }, [post.likes, userid]);

  return (
    <div className="FeedItem">
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
          <Link
            className="FeedItem__author"
            to="/profile"
            state={{id: post.author}}
          >
            {post.authorString}
          </Link>
        </span>
        <div className="FeedItem__timestamp">
          {new Date(props.post.timestamp).toLocaleDateString("en-US",
          { hour: '2-digit',
            hour12: true,
            minute: '2-digit',
          })}
          </div>
      </div>

      <span>
        <div className="FeedItem__title">{he.decode(post.title)}</div>
        <div className="FeedItem__text">
          {he.decode(post.text)}
        </div>
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
                      {/* <div className="FeedItem__profIcon"><Profile className="FeedItem__icon"/></div> */}
                      <div className="sampleComment__author">{item.authorString}:</div>
                      <div className="sampleComment__text">{he.decode(item.text)}</div>
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

export default FeedItem;