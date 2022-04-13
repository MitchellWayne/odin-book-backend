export interface User {
  _id: string;
  firstname: string;
  lastname: string;
  username: string;
  about: string;
  pfpURL: string;
  posts: string[];
  friends: string[];
  requests: string[];
  requested: string[];
};