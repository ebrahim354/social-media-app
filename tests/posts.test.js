const { query, pool } = require('../db');

const supertest = require('supertest');
const app = require('../App');
const api = supertest(app);
let token = null;
let postId = null;
let commentId = null;
beforeAll(async () => {
	await query('delete from comment_likes');
	await query('delete from comments');
	await query('delete from post_likes');
	await query('delete from posts');
	await query(`delete from users where username = 'postTester'`);
	const data = await api
		.post('/api/auth/register')
		.send({
			username: 'postTester',
			password: 'postTester',
			email: 'postTester@gmail.com',
		})
		.expect(200);

	expect(data.body.user).toBeDefined();
	expect(data.body.token).toBeDefined();

	token = data.body.token;
});

test('creating a new post', async () => {
	const res = await api
		.post('/api/posts/')
		.send({
			description: 'what is up my first post from super test and pg!!',
		})
		.auth(token, {
			type: 'bearer',
		})
		.expect(200);

	expect(res.body.data.post).toBeDefined();
	expect(res.body.data.post.description).toEqual(
		'what is up my first post from super test and pg!!'
	);
	postId = res.body.data.post.id;
});

test('correct post updates', async () => {
	const res = await api
		.put(`/api/posts/${postId}`)
		.send({
			updates: {
				description: 'updated post',
				id: 14444,
				author: 333,
			},
		})
		.auth(token, {
			type: 'bearer',
		})
		.expect(200);
	expect(res.body.data.post).toBeDefined();
	expect(res.body.data.post.description).toEqual('updated post');
	expect(res.body.data.post.id).toEqual(postId);
	expect(res.body.data.post.author).not.toEqual(333);
});

test('invalid post updates', async () => {
	const res = await api
		.put(`/api/posts/${postId}`)
		.send({
			updates: {
				property: 'value',
			},
		})
		.auth(token, {
			type: 'bearer',
		})
		.expect(400);
	expect(res.body.errors).toEqual('Invalid input');
});

test(`can't like invalid posts`, async () => {
	const res = await api
		.put('/api/posts/454545/like')
		.auth(token, {
			type: 'bearer',
		})
		.expect(400);
	expect(res.body.errors).toEqual('Post is not found');
});

test(`like returns true dislike returns false`, async () => {
	const res = await api
		.put(`/api/posts/${postId}/like`)
		.auth(token, {
			type: 'bearer',
		})
		.expect(200);
	const res2 = await api
		.put(`/api/posts/${postId}/like`)
		.auth(token, {
			type: 'bearer',
		})
		.expect(200);

	const res3 = await api
		.put(`/api/posts/${postId}/like`)
		.auth(token, {
			type: 'bearer',
		})
		.expect(200);
	expect(res.body.data.liked).toEqual(true);
	expect(res2.body.data.liked).toEqual(false);
	expect(res3.body.data.liked).toEqual(true);
});

test('user can add a comment on a valid post', async () => {
	const res = await api
		.post(`/api/posts/${postId}/addComment`)
		.send({
			data: {
				content: 'this is my first comment',
			},
		})
		.auth(token, {
			type: 'bearer',
		})
		.expect(200);
	commentId = res.body.data.comment.id;
	expect(res.body.data.comment.content).toEqual('this is my first comment');
});

test(`user can't add a comment on an invalid post`, async () => {
	const res = await api
		.post(`/api/posts/34535234/addComment`)
		.send({
			data: {
				content: 'this is my second comment',
			},
		})
		.auth(token, {
			type: 'bearer',
		})
		.expect(400);
	expect(res.body.errors).toEqual('Invalid input');
});

test('correct comments updates', async () => {
	const res = await api
		.put(`/api/posts/comment/${commentId}`)
		.send({
			updates: {
				content: 'updated comment',
				id: 14444,
				user_id: 333,
			},
		})
		.auth(token, {
			type: 'bearer',
		})
		.expect(200);
	expect(res.body.data.comment).toBeDefined();
	expect(res.body.data.comment.content).toEqual('updated comment');
	expect(res.body.data.comment.id).toEqual(commentId);
	expect(res.body.data.comment.user_id).toBeDefined();
	expect(res.body.data.comment.user_id).not.toEqual(333);
});

test('invalid comment updates', async () => {
	const res = await api
		.put(`/api/posts/comment/${commentId}`)
		.send({
			updates: {
				property: 'value',
			},
		})
		.auth(token, {
			type: 'bearer',
		})
		.expect(400);
	expect(res.body.errors).toEqual('Invalid input');
});

test('get a full post', async () => {
	const res = await api
		.get(`/api/posts/${postId}`)
		.auth(token, {
			type: 'bearer',
		})
		.expect(200);
	expect(res.body.data.post).toBeDefined();
});

test('delete a valid post', async () => {
	const res = await api
		.delete(`/api/posts/${postId}`)
		.auth(token, {
			type: 'bearer',
		})
		.expect(200);
	expect(res.body.data.result).toEqual(true);
});
afterAll(async () => {
	await pool.end();
});
