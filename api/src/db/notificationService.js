const { pool, query } = require('../db');
const {sendNotification} = require('../socketHandlers/notificationsHandler');



const notificaitonSeenByUser = async (userId,notificationId) => {
	try {
		await query(
			`
			update  notifications_users set seen = true where user_id = $1 and notification_id = $2;
    `,
			[userId, notificationId]
		);
	} catch (err) {
		console.log(err);
	}
};


const publishPostNotification = async (postId, userId, content) => {
	try {
		const {
			rows,
		} = await query(
			`
      with "user" as(
        select u.username as name, u.profile_picture as img from users u where u.id = $1
      ), returned_id as (
        insert into notifications(content, name, img) 
        select  $2, name, img
        from "user"
        returning id
      )
      insert into notifications_users(notification_id, user_id) 
       select returned_id.id , output.user_id 
       from returned_id, (
         select user_id from posts_subscribers
         where $3 = posts_subscribers.post_id ) output returning user_id;
      `,
			[userId, content, postId]
		);
    const subscribers = rows.map(item => item.user_id);
    sendNotification(postId, userId, content, subscribers);

	} catch (err) {
		console.log('notifications', err);
		throw new Error('something wrong happened!');
	}
};


// will not be used for now.
const publishAcceptFriendRequest = async (acceptorId, senderId) => {
	const content = 'has accepted your friend request!';
	try {
		const {rows} = await query(
			`
      with "request" as(
        select 
        r.sender as sender,
        u.username as acceptor_name,
        u.profile_picture as acceptor_img
        from friend_request r 
        join users u on u.id = r.receiver
        where r.sender = $1 and r.receiver = $2
      ), returned_id as (
        insert into notifications(content, name, img) 
        select '${content}', "request".acceptor_name, "request".acceptor_img
        from "request"
        returning id
      )
      insert into notifications_users(notification_id, user_id) 
      select returned_id.id, "request".sender
      from returned_id, "request";
      `,
			[senderId, acceptorId]
		);
    console.log('rows: ', rows[0]);
		const users = [acceptorId, senderId];
		const message = { users, content };
	} catch (err) {
		console.log('notifications', err);
		throw new Error('something wrong happened!');
	}
};

const publishSendFriendRequest = async (receiverId, senderId) => {
	const content = 'has sent you a friend request!';
	try {
		await query(
			`
      with "request" as (
        select 
        r.receiver as receiver,
        u.username as sender_name,
        u.profile_picture as sender_img
        from friend_request r 
        join users u on u.id = r.sender
        where r.sender = $1 and r.receiver = $2
      ), returned_id as (
        insert into notifications(content, name, img) 
        select '${content}', "request".sender_name, "request".sender_img
        from "request"
        returning id
      )
      insert into notifications_users(notification_id, user_id) 
      select returned_id.id, "request".receiver
      from returned_id, "request";
      `,
			[receiverId, senderId]
		);
		const users = [senderId, receiverId];
		const message = { users, content };
		await client.publish('NOTIFICATIONS', JSON.stringify(message));
	} catch (err) {
		console.log('notifications', err);
		throw new Error('something wrong happened!');
	}
};

module.exports = {
	publishPostNotification,
  notificaitonSeenByUser,
};
