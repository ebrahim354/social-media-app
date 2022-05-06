const { query, pool } = require('../db');

const supertest = require('supertest');
const app = require('../App');
const api = supertest(app);

beforeAll(async () => {
	// console.log('before all')
	await query('delete from users;');
});

test('we can register a new user and get a valid token to enter any route', async () => {
	const data = await api
		.post('/api/auth/register')
		.send({
			username: 'user2',
			password: '2',
			email: 'user2@gmail.com',
		})
		.expect(200);

	expect(data.body.user).toBeDefined();
	expect(data.body.token).toBeDefined();
});

test('we can login with the user registered in the first test and get a valid token', async () => {
	const user = await api
		.post('/api/auth/login')
		.send({
			username: 'user2',
			password: '2',
		})
		.expect(200);

	console.log(user.body);
	expect(user.body.user).toBeDefined();
	expect(user.body.token).toBeDefined();
});

afterAll(async () => {
	await pool.end();
});
