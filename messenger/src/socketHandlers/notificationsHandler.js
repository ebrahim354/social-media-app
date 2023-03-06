const { getConnection } = require('../connectionManager');

module.exports = (users, notification) => {
	const notify = JSON.stringify({
		method: 'NOTIFICATION',
		data: {
			notification,
		},
	});
	for (let user of users) {
		if (getConnection(user)) {
			getConnection(user).send(notify);
		}
	}
};
