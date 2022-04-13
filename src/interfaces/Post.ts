export interface Post {
  _id: string;
  author: string;
  authorString: string;
  title: string;
  text: string;
  timestamp: string;
  likes: string[];
  comments: string[];
  edited: boolean;
  imgURL: string;
  pfpURL: string;
}