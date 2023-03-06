const { addMessage } = require('../db/conversationService');
const {
	getConnection,
	getUsersOfConversation,
} = require('../connectionManager');

module.exports = async (userId, conversationId, content) => {
	// create the message and add it to the database.
	const message = await addMessage(userId, conversationId, content);
	// broadcast that message to the rest of the users on the conversation.
	const users = getUsersOfConversation(`${conversationId}`);
	console.log('conversationID', conversationId);
	console.log('users', users);
	const messageSent = JSON.stringify({
		method: 'MESSAGE_SENT',
		data: {
			message,
			conversationId,
			userId,
		},
	});
	for (let user of users) {
		if (getConnection(user) && user != userId) {
			getConnection(user).send(messageSent);
		}
	}
};
