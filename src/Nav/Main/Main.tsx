import './Main.scss';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../app/store';
import { setNav } from '../../features/navSlice';

import {ReactComponent as Profile} from '../../icons/person_black_24dp.svg';

function Main(props: any) {
  const nav: boolean = useSelector((state: RootState) => state.nav.value);
  const dispatch = useDispatch();

  const handleNavToggle = () => {
    dispatch(setNav(!nav));
  };

  const { user, setUi } = props;
  const navigate = useNavigate();

  const logout = async () => {  
    try {
      let response = await fetch("/users/logout", {
        method: "POST",
        credentials: "include",
      });
  
      if (response.status !== 200) {
        console.log("Logout error. See API console for more details");
      }
      document.cookie = 'loggedIn=; expires=0';
      document.cookie = 'userId=; expires=0';
      navigate('/');
    } catch (err){
      // API fetch fail
      console.log("Error on User Logout POST: \n" + err);
    }
  }

  return (
    <div className="Main">
      <span>
        {
          user.pfpURL ?
          <img className="profPicContainer" alt="user pfp"
            src={`/users/${user._id}/pfpS3/${user.pfpURL}`}>
          </img>
          :
          <div className="profPicContainer"><Profile className="profPic"/></div>
        }
        <ul className="optionList">
          <li>
            <Link
              className="option"
              to="/profile"
              state={{id: user._id}}
              onClick={() => handleNavToggle()}>
              My Profile
            </Link>
          </li>
          <li><button className="option" onClick={() => setUi('friends')}>Friends</button></li>
          {/* <li><a className="option" href="/#/post">Create Post</a></li> */}
          <li>
            <Link
              className="option"
              to="/post"
              onClick={() => handleNavToggle()}>
              Create Post
            </Link>
          </li>
          <li><button className="option" onClick={() => setUi('users')}>Find Users</button></li>
          <li><button className="option" onClick={logout}>Log Out</button></li>
        </ul>
      </span>
    </div>
  )
}

export default Main;