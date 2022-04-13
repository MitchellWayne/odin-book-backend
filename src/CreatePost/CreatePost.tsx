import './CreatePost.scss';
import React, { useState , useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reloadUser } from '../helpers/userAPI';
import { useSelector } from 'react-redux';
import { RootState } from '../app/store';

import { User } from '../interfaces/User';
import {ReactComponent as Profile} from '../icons/person_black_24dp.svg';

function CreatePost() {
  const user: User = useSelector((state: RootState) => state.user.value as User);
  const nav: boolean = useSelector((state: RootState) => state.nav.value);

  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File>();
  const [visibleFile, setVisibleFile] = useState('');
  const [errormsg, setErrormsg] = useState([]);

  const navigate = useNavigate();

  const createPost = async () => {
    let formData = new FormData();
    formData.append('title', title);
    formData.append('text', text);
    if (file) {
      formData.append('imgfile', file);
    }
    try {
      let response = await fetch(`/users/${user._id}/posts`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const parsedResponse = await response.json();

      if (response.status === 201) {
        // Post Created
        navigate('/home');

      } else {
        setErrormsg(parsedResponse.err.errors.map((err: any) => err.msg));
      }
    } catch(err) {
      console.log("Error on Post POST");
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createPost();
  };

  const handleFileUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const reader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      const targetFile = e.target.files[0];
      reader.readAsArrayBuffer(e.target.files[0]);

      reader.onload = function (reader: any) {
        const blob = new Blob([reader.target.result]);
        window.URL = window.URL || window.webkitURL;
        const blobURL = window.URL.createObjectURL(blob);
  
        setVisibleFile(blobURL);
        setFile(targetFile);
      }
    } else {
      setVisibleFile('');
    }
  };

  // Reload User from cookie
  useEffect(() => {
    reloadUser(user);
  }, [user]);

  return (
    <div className={`CreatePost ${nav ? 'CreatePost--navActive' : ''}`}>
      <div className="Posttitle">Create-a-post</div>
        <div className="Postform">
          
          <div className="Postform__header">
            <div className="Postform__profIcon"><Profile className="Postform__icon"/></div>
            <div className="Postform__author">Author (You)</div>
          </div>
          <form className="Postform__inputs" onSubmit={handleSubmit}>
            <input type="text" className="Postform__title" placeholder="Title" onChange={e => setTitle(e.target.value)}/>
            <div className="Postform__image">
              <label htmlFor="imgupload">Attach an image</label>
              <input type="file" id="imgupload"
                accept=".jpeg, .jpg, .png"
                onChange={e => handleFileUpdate(e)}
              />
            </div>

            {
              visibleFile !== '' ? 
              <img alt="file input preview" src={visibleFile}/>
              :
              null
            }

            <textarea className="Postform__text" placeholder="Post message" onChange={e => setText(e.target.value)}/>
            <input className="Postform__submit" type="submit" value="Create Post"/>
            <ul className="Postform__formErrors">
              {  
                errormsg.length > 0 ?      
                errormsg.map((error, i) => 
                  <li key={i} className="Signup__formError">{error}</li>
                )
                :
                null
              }
            </ul>
          </form>
      </div>
    </div>
  )
}

export default CreatePost;