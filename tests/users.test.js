const App = require('../App')
const supertest = require('supertest')
const { pool, query } = require('../db')
const api = supertest(App)

let token1 = null
let token2 = null
let user1 = null
let user2 = null
beforeAll(async () => {
	// const data = await api
	// 	.post('/api/auth/login')
	// 	.send({
	// 		username: 'user2',
	// 		password: '2',
	// 	})
	// 	.expect(200)
	// token1 = data.body.token

	query('delete from users')
	const data1 = await api
		.post('/api/auth/register')
		.send({
			username: 'user1',
			password: '1',
			email: 'user1@gmail.com',
		})
		.expect(200)
	const data2 = await api
		.post('/api/auth/register')
		.send({
			username: 'user2',
			password: '2',
			email: 'user2@gmail.com',
		})
		.expect(200)
	expect(data1.body.user).toBeDefined()
	expect(data1.body.token).toBeDefined()
	token1 = data1.body.token
	user1 = data1.body.user

	expect(data2.body.user).toBeDefined()
	expect(data2.body.token).toBeDefined()
	token2 = data2.body.token
	user2 = data2.body.user
})

test('get the user on the token', async () => {
	const user = await api
		.get('/api/users/')
		.auth(token1, {
			type: 'bearer',
		})
		.expect(200)

	expect(user).toBeDefined()
})

test('update the user with correct data (including the password)', async () => {
	const user = await api
		.put('/api/users/')
		.auth(token1, {
			type: 'bearer',
		})
		.send({
			updates: {
				from: 'updatedVersion',
				city: 'newPassword',
				desc: 'I love to edit sql tables via testing libraries :) ',
			},
		})
		.expect(200)

	expect(user).toBeDefined()
})

test('update the user with wrong data and trying to update the id', async () => {
	const user = await api
		.put('/api/users/')
		.auth(token1, {
			type: 'bearer',
		})
		.send({
			updates: {
				id: 20,
				someDumpName: 'dog',
				yo: 2,
			},
		})
		.expect(400)
	expect(user.body).toEqual({})
})

test('get some user with his id', async () => {
	const res = await api
		.get(`/api/users/${user2.id}`)
		.auth(token1, {
			type: 'bearer',
		})
		.expect(200)
	expect(res.body).toBeDefined()
	console.log('tests: ', res.body)
})

test('delete the current user', async () => {
	const res = await api
		.delete('/api/users/')
		.auth(token1, {
			type: 'bearer',
		})
		.expect(200)
	expect(res.text).toEqual('user deleted successfully')
})
afterAll(async () => {
	await pool.end()
})
