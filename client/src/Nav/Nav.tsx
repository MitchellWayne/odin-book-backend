import './Nav.scss'
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../app/store';

import Main from './Main';
import Friends from './Friends';
import Users from './Users';
import { User } from '../interfaces/User';

function Nav() {
  const user: User = useSelector((state: RootState) => state.user.value as User);
  const [uiSelector, setUiSelector] = useState('default');

  const renderSwitch = () => {
    switch(uiSelector) {
      case 'friends': return <Friends user={user} setUi={setUiSelector}/>
      case 'users': return <Users currentUser={user} setUi={setUiSelector}/>
      case 'default': return <Main  user={user} setUi={setUiSelector}/>
      default:  return <Main  user={user} setUi={setUiSelector}/>
    }
  };

  return (
    <div className="Nav">
      {renderSwitch()}
    </div>
  )
}

export default Nav;