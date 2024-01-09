const users = require('./User');
const posts = require('./Post');
const chats = require('./Chat');
const notifications = require('./Notification');

const operations = [
	users.createUsersTable,
	chats.createConversationsTable,

	users.createFriendRequetsTable,
	users.createFiendshipTable,

	chats.createMessagesTable,
	chats.createUsersConversationsTable,

	posts.createPostsTable,
	posts.createPostLikesTable,
	posts.createCommentsTable,
	posts.cerateCommentLikesTable,
	posts.createPostsSubscibersTable,


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
			console.log('error: ', err);
		}
	}
};

init();

module.exports = init;
