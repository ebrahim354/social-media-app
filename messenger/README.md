# massenger
a socket manager / massenger API for:  https://github.com/ebrahim354/social-media-api

# How it works?
- a user opens the socket connection
- the user sends an authentication message with his id.
- the server stores the userId alongside it's dedicated connection object.
- the server then asks the database for top 10 conversations for this user.
- the server sends them back to the user along side the state of the conversation and the last active date.
- the server broad casts to friends of the user that he is online.
- a user can send a message with his id and the conversation id.
- the server asks the database for users connected to this conversation.
- asking the database each time on messaging is not effecient so we will use caching to cach the opened
  conversations but after we make sure that it's working first.
- the server broadcasts the message to all the connected users then saves it to the database.
- a user can perform an action that triggeres a notification on the api side.
- the api will handle notification storing then ask the socket manager to send the notifications
  to all the subscribed and opened user via a private api on the massenger.
  
# Connection manager
- is a hash map for user connections the key is userId and the value is the open connection reference.
- redis will be used later onlater.
  
   
# Protocol
- requests and responses are in JSON format using JSON.stringify() before sending and JSON.parse() on receiving.
- each message contains : method, data.<br/>
	method is a string specified for certain operations.<br/>
	data is an object that contains the data that is expected for specific operations.
  
# REST API
- There are Two end points.
 - The first one is private and is used for comunications between Massenger and the main API to deliver notifications functionality.
 - the second one is public for users manage their massenger.
## Massenger:
prefix: `/Massenger`

### Start a conversation with any number of users:
route: `/startConversation`
method: POST
body:
<pre>{
  userIds: string[]
}
</pre>

<hr>

### Get one of your own conversations:
route: `/:conversationId`
method: GET
