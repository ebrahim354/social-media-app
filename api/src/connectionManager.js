const { setInterval } = require('timers');

// we have 3 maps.
// "user_connections" maps user ids into their connections objects.
// "user_conversations" maps a user id into his current array of top conversations.
// "conversation_users" maps conversations id to the current array of connected users.

const user_connection = new Map();
const user_onlineFriends = new Map();
const user_conversations = new Map();
const conversation_users = new Map();

const clearCache = () => {
	console.log('clearing cache'); 	
	for (let userId in user_connection) {
		if (user_connection[userId].state == 'closed') {
			userDisconnected(userId);
			delete user_connection[userId];
		};
		/*
		const convs = getConversations(userId);
		for (let cid of convs) {
			const users = getUsersOfConversation(cid);
			for (let uid of users) {
				if (uid == userId) continue;
				getConnection(uid).send(
					JSON.stringify({
						method: 'USER_LEFT',
						data: {
							userId,
							conversationId: cid,
						},
					})
				);
			}
			removeUserFromConversation(userId, cid);
		}
		removeConversations(userId);
		*/
	}
};

setInterval(clearCache, 50000);

const getConnection = userId => {
	return user_connection[userId];
};

const removeConnection = userId => {
	delete user_connection[userId];
};

const addConnection = (userId, connection) => {
	user_connection[userId] = connection;
};

const getConversations = userId => {
	return user_conversations[userId];
};

const removeConversations = userId => {
	delete user_conversations[userId];
};

const addConversations = (userId, conversationsIds) => {
	if (!user_conversations[userId]) user_conversations[userId] = [];
	for (let convId of conversationsIds) {
		user_conversations[userId].push(convId);
	}
};

const userConnected = (userId, onlineUsers) => {
	if(!getConnection(userId)) return;
	user_onlineFriends[userId] = onlineUsers;
	for (let friendId of onlineUsers) {
		if(getConnection(friendId) && user_onlineFriends[friendId]) 
			user_onlineFriends[friendId].push(userId);
	}
};

const userDisconnected = (userId) => {
	if(!user_onlineFriends[userId])  return;
	for(let friendId of user_onlineFriends[userId]){
		if(!getConnection(friendId)) continue;
		getConnection(friendId).send(
			JSON.stringify({
				method: 'USER_LEFT',
				data: {
					userId,
				},
			})
		);
	}
	delete user_onlineFriends[userId];
}

const getUsersOfConversation = convId => {
	return conversation_users[convId];
};

const removeUserFromConversation = (userId, convId) => {
	conversation_users[convId] = conversation_users[convId].filter(
		usr => usr != userId
	);
	if (conversation_users[convId].length == 0) delete conversation_users[convId];
};

const addUserToConversation = (convId, userId) => {
	if (!conversation_users[convId]) conversation_users[convId] = [];
	conversation_users[convId].push(userId);
};


module.exports = {
	getConnection,
	addConnection,
	addConversations,
	getConversations,
	addUserToConversation,
	getUsersOfConversation,
	removeConnection,
	removeConversations,
	removeUserFromConversation,
	userConnected,
	userDisconnected,
};
