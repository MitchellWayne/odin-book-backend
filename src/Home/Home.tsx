import './Home.scss'
import { useEffect } from 'react';
import { reloadUser } from '../helpers/userAPI';
import { useSelector } from 'react-redux';
import { RootState } from '../app/store';

import { User } from '../interfaces/User';
import Feed from '../Feed';

function Home() {
  const user: User = useSelector((state: RootState) => state.user.value as User);

  // Reload User from cookie
  useEffect(() => {
    // This only reloads user in store if we detect user as empty and a user cookie still exists
    reloadUser(user);
  }, [user]);
  
  return (
    <div className="Home">
      <Feed user={user}/>
    </div>
  )
};

export default Home;