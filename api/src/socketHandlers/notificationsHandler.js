const { getConnection } = require('../connectionManager.js');

const sendNotification = (publisherId, authorId, content, subscribers) => {
	const notify = JSON.stringify({
		method: 'NOTIFICATION_SENT',
		data: {
			publisherId,	
			authorId,
			content
		},
	});
	for (let user of subscribers) {
		if (getConnection(user)) {
			getConnection(user).send(notify);
		}
	}
};




module.exports = {
	sendNotification,
}
