import { store } from '../app/store';
import { addUser } from '../features/userSlice';
import { User } from '../interfaces/User';

export const getUserInfo = async () => {
  let userID = '';
  const cookies = document.cookie.split('; ');

  if (cookies.some((item) => item.includes('loggedIn=true'))){
    cookies.forEach((cookie) => {
      const [key, value] = cookie.split('=');
      if (key === "user") {
        userID = value;
      }
    })
  }

  if (userID !== '') {
    try {
      let response = await fetch(`/users/${userID}`, {
        method: "GET",
        credentials: "include",
      });
      const user = await response.json();

      if(response.status === 200) {
        return user;
      } else {
        console.log("Error on GET by user id")
      }
    } catch {
      console.log("Error on GET by user id block")
    }
  } else {
    return null;
  }
};

export const createUser = async (params: URLSearchParams) => {
  try {
    let response = await fetch(`/users/`, {
      method: "POST",
      body: params,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    if (response.status === 406) {
      return ({status: response.status, msg: "Email already taken, please use another."});
    } else if (response.status === 201) {
      return ({status: response.status, msg: "Successfully created new user"})
    } else {
      throw new Error("API Fetch failed");
    }
  } catch(err) {
    console.log("Error on User POST");
  }
}

export const reloadUser = async (user: User, forceReload: boolean = false) => {
  if (!user._id || forceReload) {
    let reloadUser = await getUserInfo();
    store.dispatch(addUser(reloadUser));
    console.log('Reloading user info');
  }
}