import { Navigate } from 'react-router-dom';

function authenticate(): boolean {
  if (document.cookie.split(';').some((item) => item.includes('loggedIn=true')))
    return true;
  else 
    return false;
}

export function PrivateRoute({ children }:{ children: any }){
  const auth = authenticate();
  return auth ? children : <Navigate to='/'/>;
}

export function ReversePrivateRoute({ children }:{ children: any }){
  const auth = authenticate();
  return auth ? <Navigate to='/home'/> : children;
}