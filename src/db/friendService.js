const { query } = require('../db');
const { areFriends, requestSent } = require('./utils/userUtils');

const acceptFriendRequest = async (userId, id) => {
	const { rows } = await query(`select * from users where id in ($1, $2)`, [
		userId,
		id,
	]);
	const [sender, receiver] =
		rows[0].id === userId ? [rows[0], rows[1]] : [rows[1], rows[0]];
	if (!(sender && receiver) || rows.length != 2) {
		throw new Error('Invalid ids');
	}
	const sent = await requestSent(userId, id);
	const friends = await areFriends(userId, id);
	if (!sent) throw new Error('already sent');
	if (friends) throw new Error('already friends');
	// TBD:
	// use transactions.
	await query(
		'delete from friend_request where sender in ($1, $2) and receiver in($1, $2)',
		[userId, id]
	);
	await query('insert into friendship(user1_id, user2_id) values($1, $2)', [
		userId,
		id,
	]);
};

const sendOrDeleteFriendRequest = async (userId, id) => {
	const { rows } = await query(` select * from users where id in ($1, $2)`, [
		userId,
		id,
	]);
	const [sender, receiver] =
		rows[0].id === userId ? [rows[0], rows[1]] : [rows[1], rows[0]];
	if (!(sender && receiver) || rows.length != 2) throw new Error('Invalid ids');
	const friends = await areFriends(userId, id);
	const sent = await requestSent(userId, id);
	if (friends) throw new Error('Already friends');
	if (!sent) {
		await query('insert into friend_request(sender, receiver) values($1, $2)', [
			userId,
			id,
		]);
		return true;
	} else {
		await query(
			'delete from friend_request where (sender = $1 and receiver = $2) or (sender = $2 and receiver = $1)',
			[userId, id]
		);
		return false;
	}
};

const unfriend = async (userId, id) => {
	const { rows } = await query(` select * from users where id in ($1, $2)`, [
		userId,
		id,
	]);
	const [sender, receiver] =
		rows[0].id === userId ? [rows[0], rows[1]] : [rows[1], rows[0]];
	if (!(sender && receiver) || rows.length != 2) throw new Error('Invalid ids');
	const friends = await areFriends(userId, id);
	if (!friends) throw new Error('Invalid request');
	await query(
		'delete from friendship where user1_id in ($1, $2) and user2_id in ($1, $2)',
		[userId, id]
	);
};

// TBD.
// add block functionality.

module.exports = {
	acceptFriendRequest,
	sendOrDeleteFriendRequest,
	unfriend,
};
