const users = require('./User');
const posts = require('./Post');
const chats = require('./Chat');
const notifications = require('./Notification');

const operations = [
	users.createUsersTable,
	users.createFriendRequetsTable,
	users.createFiendshipTable,

	posts.createPostsTable,
	posts.createPostLikesTable,
	posts.createCommentsTable,
	posts.cerateCommentLikesTable,
	posts.createPostsSubscibersTable,

	chats.createConversationsTable,
	chats.createMessagesTable,
	chats.createUsersConversationsTable,

	notifications.createNotificationsTable,
	notifications.createNotificationsUsersTable,
];

const init = async () => {
	for (let func of operations) {
		try {
			const res = await func();
			if (res.command === 'CREATE') {
				console.log(`${func.name} called successfully!`);
			} else {
				console.log(res);
			}
		} catch (err) {
			console.log(err);
		}
	}
};

module.exports = init;
