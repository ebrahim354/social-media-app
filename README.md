# Social-media-api.
A full featured facebook like project that is written with raw SQL and uses the raw w3c webSocket API!.

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
##### Method: POST
##### Body:
<pre>
{ 
   username 
   password
   e-mail
} 
</pre>
### Login: `/lgon`
#### Method: POST
#### Body: 
<pre>{
  username or e-mail
  password
}
</pre>
<hr>

## USERS
#### Prefix: `/api/users`.

### Get full loggedin user data: `/`
#### Method: GET
<hr/>

### Get some other user's public info: `/:id`
#### Method: GET
<hr/>

### Update loggedin user's info: `/`
#### Method: PUT
<hr/>

### Delete my accound: `/`
#### Method: DEL

<hr>

## Friends
#### Prefix: `/api/friends`

### Send/Cancel a friend request: `/friendRequest/:id`













