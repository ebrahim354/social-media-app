// this code is used to create the posts table
const { query } = require('../db');

// the posts schema
const posts_columns = [
	'id BIGSERIAL PRIMARY KEY unique',
	'author INT NOT NULL REFERENCES users(id) ON DELETE CASCADE',
	'description VARCHAR(256)',
	'img text',
	'likes_count int default 0',
	'created_at timestamp NOT NULL default now()',
	'updated_at timestamp NOT NULL default now()',
];

// the post_likes schema
const post_likes_columns = [
	'post_id INT REFERENCES posts(id)  ON DELETE CASCADE',
	'user_id INT REFERENCES users(id)  ON DELETE CASCADE',
	'liked bool not null default true',
	'PRIMARY KEY (post_id, user_id)',
];
const comments_columns = [
	'id bigserial primary key unique',
	'post_id INT references posts(id)  ON DELETE CASCADE',
	'user_id int references users(id)  ON DELETE CASCADE',
	'content text not null',
	'likes_count int default 0',
	'img text',
	'created_at timestamp not null default now()',
	'updated_at timestamp not null default now()',
];
const comment_likes_columns = [
	'comment_id int references comments(id)  ON DELETE CASCADE',
	'user_id int references users(id) ON DELETE CASCADE',
	'liked bool not null default true',
	'primary key (comment_id, user_id)',
];

const posts_subscribers = [
	'post_id int references posts(id)  ON DELETE CASCADE',
	'user_id int references users(id) ON DELETE CASCADE',
	'primary key (post_id, user_id)',
];

const createPostsSubscibersTable = () => {
	return query(
		`CREATE TABLE IF NOT EXISTS posts_subscribers(${posts_subscribers.join()});`
	);
};

const createPostsTable = () => {
	return query(`CREATE TABLE IF NOT EXISTS posts(${posts_columns.join(',')});`);
};

const createPostLikesTable = () => {
	return query(
		`CREATE TABLE IF NOT EXISTS post_likes(${post_likes_columns.join(',')});`
	);
};

const createCommentsTable = () => {
	return query(
		`create table IF NOT EXISTS comments(${comments_columns.join(',')});`
	);
};
const cerateCommentLikesTable = () => {
	return query(
		`create table IF NOT EXISTS comment_likes(${comment_likes_columns.join(
			','
		)});`
	);
};
module.exports = {
	createPostsTable,
	createPostLikesTable,
	createCommentsTable,
	cerateCommentLikesTable,
	createPostsSubscibersTable,
};
