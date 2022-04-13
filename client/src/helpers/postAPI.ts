import { Post } from "../interfaces/Post";
import { User } from "../interfaces/User";

// export const populateFeedList = async (user: User) => {
//   let populatedFeed: Post[] = [];

//   if (user && user.friends) {
//     const users = user.friends.concat(user._id);
//     await users.forEach( async (userID) => {
//       try {
//         let response = await fetch(`/users/${userID}/posts`, {
//           method: "GET",
//           credentials: "include",
//         });
//         const postList = await response.json();
//         await postList.forEach((post: Post) => {
//           populatedFeed.push(post);
//           // populatedFeed = [...populatedFeed, post];
//         });
//         // populatedFeed.sort(function(a,b){
//         //   return new Date(b.timestamp).valueOf() - new Date(a.timestamp).valueOf();
//         // });
//       } catch (err){
//         console.log("Failed to get postlist by friendID");
//       }
//     });
//     console.log(populatedFeed);
//     return populatedFeed;
//   }

//   else return [];
// }