const { query } = require('../db');

const notifications_columns = [
	'id BIGSERIAL PRIMARY KEY unique',
	'content text NOT NULL',
	'img text',
	'name text not null',
	'create_at timestamp NOT NULL default now()',
];

const notifications_users_columns = [
	'user_id INT REFERENCES users(id) ON DELETE CASCADE',
	'notification_id INT REFERENCES notifications(id)  ON DELETE CASCADE',
	'seen BOOLEAN default false',
	'primary key(user_id, notification_id)',
];
const createNotificationsTable = () => {
	return query(`CREATE TABLE notifications(${notifications_columns.join()});`);
};
const createNotificationsUsersTable = () => {
	return query(
		`CREATE TABLE notifications_users(${notifications_users_columns.join()});`
	);
};
module.exports = {
	createNotificationsTable,
	createNotificationsUsersTable,
};
