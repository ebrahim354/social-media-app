const users = require('./User');
const posts = require('./Post');
const chats = require('./Chat');
const { pool } = require('../db');

const operations = [
	users.createUsersTable,
	users.createFriendRequetsTable,
	users.createFiendshipTable,

	posts.createPostsTable,
	posts.createPostLikesTable,
	posts.createCommentsTable,
	posts.cerateCommentLikesTable,

	chats.createConversationsTable,
	chats.createMessagesTable,
	chats.createUsersConversationsTable,
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
	pool.end();
};

init();

module.exports = init;
