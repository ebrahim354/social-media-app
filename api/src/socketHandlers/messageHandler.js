const { addMessage } = require('../db/conversationService.js');
const {
	getConnection,
} = require('../connectionManager');

module.exports = async (senderId, receiverId, content) => {
	// create the message and add it to the database.
	const message = await addMessage(senderId, receiverId, content);
	message.createdAt = message.created_at;
	// send it to user if online.
	const messageSent = JSON.stringify({
		method: 'MESSAGE_SENT',
		data: {
			message,
		},
	});
	if(getConnection(receiverId)){
			getConnection(receiverId).send(messageSent);
	}
	if(getConnection(senderId)){
			getConnection(senderId).send(messageSent);
	}
};
