// this code is used to create the posts table
const { query } = require('../db')

// the posts schema
const posts_columns = [
	'id BIGSERIAL PRIMARY KEY unique',
	'author INT NOT NULL REFERENCES users(id)',
	'description VARCHAR(256)',
	'img text',
	'create_at timestamp NOT NULL default now()',
	'updated_at timestamp NOT NULL default now()',
]

// the post_likes schema
const post_likes_columns = [
	'post_id INT REFERENCES posts(id) NOT NULL',
	'user_id INT REFERENCES users(id) NOT NULL',
	'liked bool not null default true',
	'PRIMARY KEY (post_id, user_id)',
]
const comments_columns = [
	'id bigserial primary key unique',
	'post_id INT references posts(id) not null',
	'user_id int references users(id) not null',
	'content text not null',
	'img text',
	'created_at timestamp not null default now()',
	'updated_at timestamp not null default now()',
]
const comment_likes_columns = [
	'comment_id int references comments(id) not null',
	'user_id int references users(id) not null',
	'primary key (comment_id, user_id)',
]

const createPostsTable = () => {
	return query(`CREATE TABLE posts(${posts_columns.join(',')});`)
}

const createPostLikesTable = () => {
	return query(`CREATE TABLE post_likes(${post_likes_columns.join(',')});`)
}

const createCommentsTable = () => {
	return query(`create table comments(${comments_columns.join(',')});`)
}
const cerateCommentLikesTable = () => {
	return query(
		`create table comment_likes(${comment_likes_columns.join(',')});`
	)
}
module.exports = {
	createPostsTable,
	createPostLikesTable,
	createCommentsTable,
	cerateCommentLikesTable,
}
