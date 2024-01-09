const { addMessage } = require('../db/conversationService.js');
const {
	getConnection,
} = require('../connectionManager');

module.exports = async (senderId, conversationId, content) => {
	// create the message and add it to the database.
	const message = await addMessage(senderId, conversationId, content);
	console.log('msg', message);
	const convUsers = [...message.users];
	delete message.users;
	// send it to users if online.
	const messageSent = JSON.stringify({
		method: 'MESSAGE_SENT',
		data: {
			message,
		},
	});
	for(let uid of convUsers){
		if(getConnection(uid)){
				getConnection(uid).send(messageSent);
		}
	}
	if(getConnection(senderId)){
			getConnection(senderId).send(messageSent);
	}
};
