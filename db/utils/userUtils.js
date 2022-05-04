const { query } = require('../index');

const areFriends = async (user1, user2) => {
	const { rows } = await query(
		`select * from friendship where user1_id in ($1, $2) and user2_id in ($1, $2)`,
		[user1, user2]
	);
	return rows.length;
};

const requestSent = async (user1, user2) => {
	const { rows } = await query(
		`select * from friend_request where sender in ($1, $2) and receiver in ($1, $2)`,
		[user1, user2]
	);
	return rows.length;
};
module.exports = { areFriends, requestSent };
