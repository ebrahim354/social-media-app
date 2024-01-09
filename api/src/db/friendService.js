const { query, pool } = require('../db');
const { areFriends, requestSent } = require('./utils/userUtils');

const acceptFriendRequest = async (userId, id) => {
	const client = await pool.connect();
	try{
		await client.query('begin');

			const { rows } = await client.query(`select * from users where id in ($1, $2)`, [
				userId,
				id,
			]);
			const [sender, receiver] =
				rows[0].id === userId ? [rows[0], rows[1]] : [rows[1], rows[0]];
			if (!(sender && receiver) || rows.length != 2) {
				throw new Error('Invalid ids');
			}
			const sent = await requestSent(userId, id, false, client);
			const friends = await areFriends(userId, id, client);
			if (!sent) throw new Error('already sent');
			if (friends) throw new Error('already friends');

			await client.query(
				'delete from friend_request where sender in ($1, $2) and receiver in($1, $2)',
				[userId, id]
			);

			const conv = await client.query(`
				insert into conversations default values returning *;
			`);
			const conversationId = conv.rows[0].id;

			await client.query(`
				insert into users_conversations values ($1, ${conversationId}), ($2, ${conversationId});
			`, [userId, id]);

			await client.query('insert into friendship(user1_id, user2_id, private_conversation_id) values($1, $2, $3)', [
				userId,
				id,
				conversationId,
			]);
		await client.query('commit');
	} catch(err){
		await client.query(`rollback`);
		console.log(err);
	} finally {
		client.release();
	}
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
	const client = await pool.connect();
	try{
		await client.query('begin');

			const { rows } = await client.query(` select * from users where id in ($1, $2)`, [
				userId,
				id,
			]);
			const [sender, receiver] =
				rows[0].id === userId ? [rows[0], rows[1]] : [rows[1], rows[0]];
			if (!(sender && receiver) || rows.length != 2) throw new Error('Invalid ids');


			const { rows: friends } = await client.query(
				`select * from friendship where user1_id in ($1, $2) and user2_id in ($1, $2)`,
				[userId, id]
			);
			if (!friends.length) throw new Error('Invalid request');
			const convId = friends[0].private_conversation_id;
			await client.query(
				'delete from conversations where id = $1;',
				[convId]
			);

		await client.query('commit');
	} catch(err){
		console.log(err);
		await client.query('rollback');
	} finally {
		client.release();
	}
};

const getFriends = async (userId) => {
	try{
		const { rows } = await query(` select * from friendship fs where $1 in (user1_id, user2_id);`, [
			userId,
		]);
		const friends = rows.map(r => 
			({id: r.user1_id == userId ? r.user2_id : r.user1_id, 
				conversationId: r.private_conversation_id})
		);
		return friends;
	} catch(err){
		console.log(err);
	}
};




// TBD:
// add block functionality.

module.exports = {
	acceptFriendRequest,
	sendOrDeleteFriendRequest,
	unfriend,
	getFriends
};
