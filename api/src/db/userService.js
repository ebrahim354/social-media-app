const { query } = require('../db');
const { objectToParams } = require('./utils/dynamicSql');

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
		`select u1.*, u1.profile_picture as "profilePicture", u1.cover_picture as "coverPicture",
    coalesce (array_agg(json_build_object('id', u2.id, 'username', u2.username, 'profilePicture', u2.profile_picture)) 
    filter (where u2.username is not null), '{}') friends,
    coalesce (array_agg(json_build_object('id', u3.id, 'username', u3.username, 'profilePicture', u3.profile_picture)) 
    filter (where u3.username is not null), '{}') friendRequests
    from users u1
    left join friendship f on u1.id in (f.user1_id, f.user2_id) 
    left join users u2 on (u2.id in (f.user1_id, f.user2_id) and u2.id != u1.id)
    left join friend_request f2 on u1.id = f2.receiver 
    left join users u3 on f2.sender = u3.id ${filter.where} group by u1.id`,
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

const getSimpleUser = async id => {
	const {
		rows: [user],
	} = await query('select * from users where id = $1;', [id]);
	delete user.password;
	delete user.updated_at;
	delete user.created_at;
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
