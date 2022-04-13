import './App.scss';

import { HashRouter, Routes, Route } from "react-router-dom";
import { PrivateRoute, ReversePrivateRoute } from './router/PrivateRoutes';

import Login from './Login';
import Signup from './Signup';
import Header from './Header';
import Home from './Home';
import CreatePost from './CreatePost';
import Profile from './Profile';

function App() {
  return (
    <div className="App">
      <HashRouter basename="/">
        <Routes>
          <Route path = '/' element={ <ReversePrivateRoute><Login/></ReversePrivateRoute> }/>
          <Route path = '/signup' element={ <ReversePrivateRoute><Signup/></ReversePrivateRoute> }/>
          <Route path = '/home' element={ <PrivateRoute><Header/><Home/></PrivateRoute> }/>
          <Route path = '/post' element={ <PrivateRoute><Header/><CreatePost/></PrivateRoute> }/>
          <Route path = '/profile' element={ <PrivateRoute><Header/><Profile/></PrivateRoute> }/>
        </Routes>
      </HashRouter>
    </div>
  );
}

export default App;
