import './Header.scss';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../app/store';
import { setNav } from '../features/navSlice';

import {ReactComponent as Profile} from '../icons/person_black_24dp.svg';
import Nav from '../Nav';

function Header() {
  const nav: boolean = useSelector((state: RootState) => state.nav.value);
  const dispatch = useDispatch();

  const handleNavToggle = () => {
    dispatch(setNav(!nav));
  };

  return (
    <>
      <div className="Header">
        <a href="/#/home" className="headerTextLogo">Odinbook</a>
        <div className="headerUtils">
          <button className="headerNavToggle" onClick={() => {handleNavToggle()}}>
            <div className="profIconWrapper"><Profile className="profIcon"/></div>
          </button>
        </div>
      </div>
      {
        nav ?
        <Nav />
        :
        null
      }
    </>
  )
}

export default Header;