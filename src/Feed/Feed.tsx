import './Feed.scss';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../app/store';

import FeedItem from '../FeedItem';
import { Post } from '../interfaces/Post';

function Feed (props: any) {
  const nav: boolean = useSelector((state: RootState) => state.nav.value);
  const isFeedFiltered: boolean = useSelector((state: RootState) => state.feed.isFiltered);
  const feedFilter: string = useSelector((state: RootState) => state.feed.filter);
  const { user } = props;
  const [feed, setFeed] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load Feed Content via User & Friends Post lists
  useEffect(() => {
    const getFeed = async () => {
      setIsLoading(true);
      setFeed([]);
      if (user && user.friends) {
        const users = user.friends.concat(user._id);
        users.forEach( async (userID: string) => {
          try {
            let response = await fetch(`/users/${userID}/posts`, {
              method: "GET",
              credentials: "include",
            });
            const postList = await response.json();
            await postList.forEach((postObj: Post) => {
              setFeed((feed) => [...feed, postObj]
              .sort(function(a,b){
                return new Date(b.timestamp).valueOf() - new Date(a.timestamp).valueOf();
              }));
            });
            setTimeout(() => {setIsLoading(false)}, 1000);
          } catch (err){
            console.log("Failed to get postlist by friendID");
          }
        });
      }
    }
    getFeed();
  }, [user]);

  return (
    <div className={`Feed ${nav ? 'Feed--navActive' : ''}`}>
      <div className="feedList">
      {
        !isLoading && feed && feed.length  > 0 ?
        <>
        {
          !isFeedFiltered ?
          feed.map((post: Post) => {
          return (
          <FeedItem
            key={post._id}
            userid={user._id}
            post={post}
          />)})
          :
          feed.map((post: Post) => {
          if(post.authorString.toLowerCase().includes(feedFilter.toLowerCase()))
            return (
            <FeedItem 
              key={post._id}
              userid={user._id}
              post={post}
            />)
          else return (null);
          })
        }
        </>        
        :
        <>
        {
          isLoading ?
          <div className="loadingMsg">Loading Posts...</div>
          :
          null
        }
        </>
      }
      </div>
    </div>
  )
}

export default Feed;