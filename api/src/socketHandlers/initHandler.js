const {
	addConnection,
	addConversations,
	addUserToConversation,
	getUsersOfConversation,
} = require('../connectionManager.js');
const { getTopConversations } = require('../db/conversationService.js');
const { getConnection, userConnected } = require('../connectionManager.js');
const { getFriends } = require('../db/friendService.js');

// this method handles multi user conversations (support for them will be added in next iteration not now).
/*
const multi_user_conv_init =  async (userId, connection) => {
	if (getConnection(userId) && getConnection(userId).state != 'closed') return;
	addConnection(userId, connection);
	const conversations = await getTopConversations(userId);
	addConversations(
		userId,
		conversations.map(conv => conv.id)
	);
	for (let conv of conversations) {
		addUserToConversation(conv.id, userId);
	}
	for (let i = 0; i < conversations.length; i++) {
		let users = getUsersOfConversation(conversations[i].id);
		if (users.length < 1) {
			conversations[i].active = false;
			continue;
		}
		conversations[i].active = true;
		for (let usrId of users) {
			console.log('usrs: ', users);
			if (usrId == userId) continue;
			getConnection(usrId).send(
				JSON.stringify({
					method: 'USER_JOINED',
					data: {
						userId,
						conversationId: conversations[i].id,
					},
				})
			);
		}
	}

	connection.send(
		JSON.stringify({
			method: 'INIT',
			data: conversations,
		})
	);
};
*/

module.exports = async (userId, connection) => {
	if (getConnection(userId) && getConnection(userId).state != 'closed') return;
	addConnection(userId, connection);
	const friends = await getFriends(userId);
	const onlineFriends = friends.filter(f => !!getConnection(f));
	console.log('online friends: ', friends, userId);
	userConnected(userId, onlineFriends);
	connection.send(
		JSON.stringify({
			method: 'INIT',
			data: {
				onlineFriends,
			}
		})
	);
	onlineFriends.map(friend => {
		getConnection(friend).send(
			JSON.stringify({
				method: 'USER_JOINED',
				data: {
					userId,
				},
			})
		);
	});
};
