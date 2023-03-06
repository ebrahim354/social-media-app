const {
	addConnection,
	addConversations,
	addUserToConversation,
	getUsersOfConversation,
} = require('../connectionManager');
const { getTopConversations } = require('../db/conversationService');
const { getConnection } = require('../connectionManager');

module.exports = async (userId, connection) => {
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
	connection.send(JSON.stringify(conversations));
};
