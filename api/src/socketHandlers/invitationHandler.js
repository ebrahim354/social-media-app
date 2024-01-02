const { getConnection } = require('../connectionManager');
const { getUsersOfConversations } = require('../db/conversationService');

module.exports = async (conversationId, creatorId) => {
	// broadcast the invitation to the rest of the added users on the .
	const dbUsers = await getUsersOfConversations([conversationId]);
	const users = dbUsers[0].users;
	const invitationSent = JSON.stringify({
		method: 'INVITATION_SENT',
		data: {
			conversationId,
		},
	});
	for (let user of users) {
		if (getConnection(user.id) && user.id != creatorId) {
			getConnection(user.id).send(invitationSent);
		}
	}
};
