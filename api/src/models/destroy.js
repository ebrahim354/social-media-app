const { query, pool } = require('../db');

const destroy = async () => {
	const tables = [
		'friendship',
		'notifications_users',
		'friend_request',
		'users_conversations',
		'posts_subscribers',
		'comment_likes',
		'comments',
		'post_likes',
		'posts',
		'messages',
		'conversations',
		'users',
		'notifications',
	];

	for (let table of tables) {
		try {
			await query(`drop table if exists ${table};`);
		} catch (err) {
			console.log(err);
			console.log('error!');
		}
		console.log('dropped table: ', table);
	}
	await pool.end();
};

destroy();

module.exports = destroy;
