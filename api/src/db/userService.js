const { query } = require('../db');
const { objectToParams } = require('./utils/dynamicSql');
const { areFriends, requestSent } = require('./utils/userUtils');

const userExists = async ({ username, email }) => {
	const {
		rows: [user],
	} = await query(
		'select username from users where username = $1 or email = $2',
		[username, email]
	);
	return user;
};

const insertUser = async ({ username, email, password }) => {
	try {
		const {
			rows: [user],
		} = await query(
			'insert into users(username, password, email) values($1, $2, $3) returning *',
			[username, password, email]
		);
		user.friends = [];
		user.friendRequests = [];
		return user;
	} catch (err) {
		throw err;
	}
};

const getFullUser = async ({ username, email, id }) => {
	let filter = {};
	if (username) filter = { where: 'where u1.username = $1', val: username };
	else if (email) filter = { where: 'where u1.email = $1', val: email };
	else if (id) filter = { where: 'where u1.id = $1', val: id };
	else throw new Error('Invalid input');

	const {
		rows: [user],
	} = await query(
		`
		select u1.*, u1.profile_picture as "profilePicture", u1.cover_picture as "coverPicture",
    coalesce 
		(
			array_agg
			(
				json_build_object
				(
					'id', u2.id, 
					'username', u2.username, 
					'profilePicture', u2.profile_picture, 
					'conversation_id', f.private_conversation_id
				)
			) 
    	filter (where u2.username is not null), '{}'
		) friends,
		(
			select 
			coalesce 
			(
				array_agg
				(
					json_build_object('id', u3.id, 'username', u3.username, 'profilePicture', u3.profile_picture)
				) 
				filter (where u3.username is not null), '{}'
			)  
			from friend_request
			join users u3 on friend_request.sender = u3.id 
			where friend_request.receiver = u1.id
		) as friendrequests,
		(
			select 
			coalesce
			(
				array_agg(conversation_id) 
    		filter (where users_conversations.user_id is not null), '{}'
			)
			from users_conversations 
			where users_conversations.user_id = u1.id and users_conversations.seen = false
		) as unread_conversations,
		(
			select count(*)	
			from notifications_users 
			where notifications_users.user_id = u1.id and notifications_users.seen = false
		) as unseen_notifications
    from users u1
    left join friendship f on u1.id in (f.user1_id, f.user2_id) 
    left join users u2 on (u2.id in (f.user1_id, f.user2_id) and u2.id != u1.id)
    ${filter.where} 
		group by u1.id`,
		[filter.val]
	);
	return user;
};

const updateUser = async (id, updates) => {
	try {
		updates.updated_at = new Date();
		const [result, vals, counter] = objectToParams(updates);
		const {
			rows: [user],
		} = await query(
			`update users set ${result} where id = $${counter} returning *;`,
			[...vals, id]
		);
		delete user.password;
		return user;
	} catch (err) {
		throw err;
	}
};

const deleteUser = async id => {
	try {
		const { rowCount } = await query(`delete from users where id = $1`, [id]);
		return !!rowCount;
	} catch (err) {
		throw err;
	}
};

const getSimpleUser = async (id, myId) => {
	const {
		rows: [user],
	} = await query('select * from users where id = $1;', [id]);
	// TBD: optimise into a single db call not 3.
	const friends = await areFriends(id, myId);
	const sent = await requestSent(myId, id, true);
	delete user.password;
	delete user.updated_at;
	delete user.created_at;
	user.areFriends = friends;
	user.friendRequestSent = sent;
	return user;
};

const getUsersWithUsername = async username => {
	const {
		rows: users,
	} = await query(`select * from users where username like '%${username}%';`);
	for(let user of users){
		user.profilePicture = user.profile_picture;
		user.coverPicture = user.cover_picture;
		delete user.password;
		delete user.profile_picture;
		delete user.cover_picture;
		delete user.updated_at;
		delete user.created_at;
	}
	return users;
};

module.exports = {
	userExists,
	insertUser,
	getFullUser,
	updateUser,
	deleteUser,
	getSimpleUser,
	getUsersWithUsername,
};
