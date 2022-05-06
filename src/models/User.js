const { query } = require('../db');

// users schema
const users_columns = [
	'id BIGSERIAL PRIMARY KEY',
	'username VARCHAR(20) UNIQUE NOT NULL',
	'email VARCHAR(50) UNIQUE NOT NULL',
	'password text NOT NULL',
	'profile_picture text',
	'cover_picture text',
	'"desc" VARCHAR(256)',
	'city VARCHAR(50)',
	'"from" VARCHAR(50)',
	'relationship INT',
	'created_at TIMESTAMP NOT NULL default now()',
	'updated_at TIMESTAMP NOT NULL default now()',
	'last_visit TIMESTAMP default now()',
];

// friendship schema
const friendship_columns = [
	'user1_id INT REFERENCES users(id) ON DELETE CASCADE',
	'user2_id INT REFERENCES users(id) ON DELETE CASCADE',
	'PRIMARY KEY (user1_id, user2_id)',
	'created_at timestamp not null default now()',
];

// friend_request schema
const friend_request_columns = [
	'sender INT REFERENCES users(id) ON DELETE CASCADE',
	'receiver INT REFERENCES users(id) ON DELETE CASCADE',
	'PRIMARY KEY (sender, receiver)',
	'created_at timestamp not null default now()',
];

const createUsersTable = () => {
	return query(`CREATE TABLE users(${users_columns.join(',')});`);
};

const createFiendshipTable = () => {
	return query(`CREATE TABLE friendship(${friendship_columns.join(',')});`);
};

const createFriendRequetsTable = () => {
	return query(
		`CREATE TABLE friend_request(${friend_request_columns.join(',')});`
	);
};

module.exports = {
	createUsersTable,
	createFiendshipTable,
	createFriendRequetsTable,
};
