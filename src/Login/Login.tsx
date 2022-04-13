import './Login.scss';
import React, { useState } from 'react';

import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addUser } from '../features/userSlice';

function Login() {
  const dispatch = useDispatch();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState(null);

  // Replaces React Router useHistory() as of v6
  const navigate = useNavigate();

  const loginUser = async () => {
    let urlParams = new URLSearchParams();
    urlParams.append('username', username);
    urlParams.append('password', password);
    try {
      let response = await fetch(`/users/login`, {
        method: "POST",
        body: urlParams,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        credentials: "include",
      });

      const parsedResponse = await response.json();

      if (response.status === 200) {
        document.cookie = `loggedIn=true; max-age=${60 * 60 * 12}`;
        document.cookie = `user=${parsedResponse.user._id}; max-age=${60 * 60 * 12}`;
        dispatch(addUser(parsedResponse.user));
        navigate('/home');
      } else {
        console.log(parsedResponse);
        setErrors(parsedResponse.message.message);
      }
    } catch(err) {
      console.log("Error on User Login POST");
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    loginUser();
  }

  const testDrive = () => {
    setUsername("fake@email");
    setPassword("Password123!");
  }

  return (
    <div className="Login">
      <div className="loginContainer">

        <form className="loginAuthBox" id="authBox" onSubmit={handleSubmit}>
          <h2 className="formTitle">Odinbook</h2>
          <input value={username} onChange={e => setUsername(e.target.value)} name="username" className="loginAuthBoxInput loginEmail" id="loginEmail" placeholder="Email" type="email" required/>
          <input value={password} onChange={e => setPassword(e.target.value)} name="password" className="loginAuthBoxInput loginPassword" placeholder="Password" type="password" required/>
          {
            errors ?
            <div className="loginErrors">{errors}</div>
            :
            null
          }
          <input className="formButton login" value="Log in" type="submit"/>
          <hr className="separator"></hr>
          <Link to="/signup" className="formButton">Create an account</Link>
          <button type="button" className="formButton" onClick={testDrive}>Test Drive Existing Account</button>
        </form>

        <div className="loginTextLogo" id="textLogo">
          <h1 className="loginTitle">Odinbook</h1>
          <h2 className="loginSubtext">Just another social site</h2>
        </div>

      </div>
    </div>
  )
};

export default Login;