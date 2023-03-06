const { query } = require('../db');

const messages_columns = [
	'id BIGSERIAL PRIMARY KEY',
	'conversation_id INT REFERENCES conversations(id) ON DELETE CASCADE',
	'author_id INT REFERENCES users(id) ON DELETE CASCADE',
	'content text',
	'created_at TIMESTAMP NOT NULL default now()',
	'updated_at TIMESTAMP NOT NULL default now()',
];

const conversations_columns = [
	'id BIGSERIAL PRIMARY KEY',
	'created_at TIMESTAMP NOT NULL default now()',
];

const users_conversations_columns = [
	'user_id INT REFERENCES users(id) ON DELETE CASCADE',
	'conversation_id INT REFERENCES conversations(id) ON DELETE CASCADE',
	'primary key (user_id, conversation_id)',
];

const createConversationsTable = () => {
	return query(`CREATE TABLE conversations(${conversations_columns.join()});`);
};

const createUsersConversationsTable = () => {
	return query(
		`CREATE TABLE users_conversations(${users_conversations_columns.join()});`
	);
};

const createMessagesTable = () => {
	return query(`CREATE TABLE messages(${messages_columns.join()});`);
};

module.exports = {
	createConversationsTable,
	createMessagesTable,
	createUsersConversationsTable,
};
