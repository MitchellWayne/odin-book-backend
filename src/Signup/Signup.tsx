import './Signup.scss';
import { useState } from 'react';
import { createUser } from '../helpers/userAPI';

function Signup() {
  const [username, setUsername] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [password, setPassword] = useState("");
  const [passwordconfirm, setPasswordconfirm] = useState("");
  const [errormsg, setErrormsg] = useState<string[]>([]);
  const [createSuccess, setCreateSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    let errors = []
    e.preventDefault();

    if (username.length < 1) errors.push("Invalid Email");
    if (firstname.length < 1) errors.push("First name cannot be empty");
    if (lastname.length < 1) errors.push("Last name cannot be empty");
    let passRegex = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})/;
    if (!password.match(passRegex)) errors.push("Please enter a strong password of minimum length 8, at least one uppercase and lowercase letter, one number, and one symbol.");
    if (password !== passwordconfirm) errors.push("Passwords do not match");

    if (errors.length > 0) setErrormsg(errors);
    else {
      let urlParams = new URLSearchParams();
      urlParams.append('username', username);
      urlParams.append('firstname', firstname);
      urlParams.append('lastname', lastname);
      urlParams.append('password', password);
      let createStatus = await createUser(urlParams);
      if (createStatus && createStatus.status === 201) {
        setCreateSuccess(true);
      }
      if (createStatus && createStatus.status === 406) {
        setErrormsg([createStatus.msg])
      }
    }
  }

  return (
    <div className="Signup">
      <a href="/#" className="Signup__home">Home</a>
      {
          !createSuccess ?
          <form action="/users" method="POST" className="Signup__form" onSubmit={handleSubmit}>
            <div className="Signup__formTitle">Create an account</div>
            <input value={username} onChange={e => setUsername(e.target.value)} name="username" className="Signup__input" id="Signup__loginEmail" placeholder="Email" type="email"/>
            <input value={firstname} onChange={e => setFirstname(e.target.value)} name="firstname" className="Signup__input" id="Signup__firstName" placeholder="First name" type="text"/>
            <input value={lastname} onChange={e => setLastname(e.target.value)} name="lastname" className="Signup__input" id="Signup__lastName" placeholder="Last name" type="text"/>
            <input value={password} onChange={e => setPassword(e.target.value)} name="password" className="Signup__input" placeholder="Password" type="password"/>
            <input value={passwordconfirm} onChange={e => setPasswordconfirm(e.target.value)} className="Signup__input" placeholder="Re-type Password" type="password"/>
            <ul className="Signup__formErrors">
              {  
                errormsg.length > 0 ?      
                errormsg.map((error, i) => 
                  <li key={i} className="Signup__formError">{error}</li>
                )
                :
                null
              }
            </ul>
            <hr className="separator"></hr>
            <input className="Signup__createAccount" type="submit" value="Create Account"/>
          </form>
          :
          <div className="Signup__form Signup__form--center">
            <div className="Signup__formTitle Signup__formTitle--nomargin">Account created!</div>
            <hr className="separator"></hr>
            <a href="/#" className="Signup__createAccount">Login</a>
          </div>
        }
    </div>
  )
};

export default Signup;