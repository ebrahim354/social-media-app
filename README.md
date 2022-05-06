# Social-media-api.
A full featured facebook like project that is written with raw SQL and uses the raw w3c webSocket API!.
The motivation behind using raw SQL was to understand the language better, My goal was to try to minimize the number of queries as much as possible,
Sometimes it went to the point where I was using one big query for a big functionality, And I've learned a lot from that.

## Features
- Posts-Timeline functionality.
- Posts could be uploaded with images.
- Comments.
- Likes for both.
- Registeration and login functionality.
- Friends system with requests.
- Real-time Notification system.
- Massenger functionalities on real-time using the massenger API: [Massenger API](https://github.com/ebrahim354/massenger.git)

## API

## AUTHENTICATION
#### Prefix: `/api/auth`.

### Register: `/register`
Method: POST <br/>
Body:
<pre>
{ 
   username 
   password
   e-mail
} 
</pre>
### Login: `/lgon`
Method: POST<br/>
Body: 
<pre>{
  username or e-mail
  password
}
</pre>
<hr>

## USERS
#### Prefix: `/api/users`.

### Get full loggedin user data: `/`
Method: GET
<hr/>

### Get some other user's public info: `/:id`
Method: GET
<hr/>

### Update loggedin user's info: `/`
Method: PUT
<hr/>

### Delete my accound: `/`
Method: DEL

<hr>

## Friends
#### Prefix: `/api/friends`

<hr>

### Send/Cancel a friend request: `/friendRequest/:userId`
Method: PUT

<hr>

### Accept a friend request: `/acceptFriendRequest/:userId`
Method: PUT

<hr>

### Unfriend: `/unfriend/:userId`
Method: PUT

<hr>

## Posts
#### Prefix: `/api/posts`

### Create post: `/`
Method: POST <br/>
Body
<pre> {
   description
   img
  }
</pre>

<hr>

### Update post: `/:postId`
Method: PUT

<hr>

### Like/Dislike post: `/:postId/like`
Method: PUT

<hr>

### Get post: `/:postId`
Method: GET

<hr>

### Get all user's posts: `/:userId/posts`
Method: GET

<hr>

### Get Timeline posts: `/`
Method: GET

<hr>

### Delete post: `/:postId`
Method: DEL

<hr>

### Comment on a post: `/:postId/addComment`
Method: POST <br/>
Body
<pre>{
      content,
      img
   }
</pre>

<hr>

### Update a comment: `/:comment/:commentId`
Method: PUT

<hr>

### Like/Dislike comment: `/LikeComment/:commentId`
Method: PUT










