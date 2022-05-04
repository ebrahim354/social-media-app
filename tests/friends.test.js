const supertest = require('supertest');
const app = require('../App');
const { pool, query } = require('../db');
const api = supertest(app);

let user1token = null;
let user2token = null;
let user1 = null;
let user2 = null;
beforeAll(async () => {
	await query('delete from friendship');
	await query('delete from friend_request');
	await query('delete from users');
	const data1 = await api
		.post('/api/auth/register')
		.send({
			username: 'user1',
			password: '1',
			email: 'user1@gmail.com',
		})
		.expect(200);
	const data2 = await api
		.post('/api/auth/register')
		.send({
			username: 'user2',
			password: '2',
			email: 'user2@gmail.com',
		})
		.expect(200);
	expect(data1.body.user).toBeDefined();
	expect(data1.body.token).toBeDefined();
	user1token = data1.body.token;
	user1 = data1.body.user;

	expect(data2.body.user).toBeDefined();
	expect(data2.body.token).toBeDefined();
	user2token = data2.body.token;
	user2 = data2.body.user;
});

describe('testing friend request functionality', () => {
	test('user1 can send a friend request to user2', async () => {
		const res = await api
			.put(`/api/friends/friendRequest/${user2.id}`)
			.auth(user1token, {
				type: 'bearer',
			})
			.expect(200);
		expect(res.text).toBe('friend request has been sent');
	});

	test('user1 can delete the friend request to user2', async () => {
		const res = await api
			.put(`/api/friends/friendRequest/${user2.id}`)
			.auth(user1token, {
				type: 'bearer',
			})
			.expect(200);
		expect(res.text).toBe('friend request is removed');
	});

	test('user2 cant accept the deleted friend request from user1', async () => {
		const res = await api
			.put(`/api/friends/acceptFriendRequest/${user1.id}`)
			.auth(user2token, {
				type: 'bearer',
			})
			.expect(400);
		expect(res.body.errors).toBe('already sent');
	});

	test('user2 can accept a friend request from user1', async () => {
		const res = await api
			.put(`/api/friends/friendRequest/${user2.id}`)
			.auth(user1token, {
				type: 'bearer',
			})
			.expect(200);
		expect(res.text).toBe('friend request has been sent');

		const res2 = await api
			.put(`/api/friends/acceptFriendRequest/${user1.id}`)
			.auth(user2token, {
				type: 'bearer',
			})
			.expect(200);
		expect(res2.text).toBe('friend request accepted');
	});

	test('user2 can unfriend user1 once', async () => {
		const res = await api
			.put(`/api/friends/unfriend/${user1.id}`)
			.auth(user2token, {
				type: 'bearer',
			});
		expect(res.text).toBe('unfriended successfully');

		const res2 = await api
			.put(`/api/friends/unfriend/${user1.id}`)
			.auth(user2token, {
				type: 'bearer',
			})
			.expect(400);
		expect(res2.body.errors).toBe('Invalid request');
	});
});
afterAll(async () => {
	await pool.end();
});
