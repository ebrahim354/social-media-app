const { query, pool } = require('../db')

const supertest = require('supertest')
const app = require('../App')
const api = supertest(app)
let token = null
let postId = null
let commentId = null
beforeAll(async () => {
	// console.log('before all')
	await query('delete from comment_likes')
	await query('delete from comments')
	await query('delete from post_likes')
	await query('delete from posts')
	await query(`delete from users where username = 'postTester'`)
	const data = await api
		.post('/api/auth/register')
		.send({
			username: 'postTester',
			password: 'postTester',
			email: 'postTester@gmail.com',
		})
		.expect(200)

	expect(data.body.user).toBeDefined()
	expect(data.body.token).toBeDefined()

	token = data.body.token
})

test('creating a new post', async () => {
	const res = await api
		.post('/api/posts/')
		.send({
			description: 'yo what up my first post from super test and pg!!',
		})
		.auth(token, {
			type: 'bearer',
		})
		.expect(200)

	console.log('response: ', res.body)
	expect(res.body).toBeDefined()
	expect(res.body.description).toEqual(
		'yo what up my first post from super test and pg!!'
	)
	postId = res.body.id
})

test('correct post updates', async () => {
	const res = await api
		.put(`/api/posts/${postId}`)
		.send({
			updates: {
				description: 'updated post biatch',
				id: 14444,
				author: 333,
			},
		})
		.auth(token, {
			type: 'bearer',
		})
		.expect(200)
	expect(res.body).toBeDefined()
	expect(res.body.description).toEqual('updated post biatch')
	expect(res.body.id).toEqual(postId)
	expect(res.body.author).not.toEqual(333)
	console.log('response: ', res.body)
})

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
		.expect(400)
	expect(res.text).toEqual('bad request')
})

test(`can't like invalid posts`, async () => {
	const res = await api
		.put('/api/posts/4/like')
		.auth(token, {
			type: 'bearer',
		})
		.expect(404)
	expect(res.text).toEqual('post is not found')
})

test(`like returns true dislike returns false`, async () => {
	const res = await api
		.put(`/api/posts/${postId}/like`)
		.auth(token, {
			type: 'bearer',
		})
		.expect(200)
	const res2 = await api
		.put(`/api/posts/${postId}/like`)
		.auth(token, {
			type: 'bearer',
		})
		.expect(200)

	const res3 = await api
		.put(`/api/posts/${postId}/like`)
		.auth(token, {
			type: 'bearer',
		})
		.expect(200)
	expect(res.body).toEqual(true)
	expect(res2.body).toEqual(false)
	expect(res3.body).toEqual(true)
})

test('user can add a comment on a valid post', async () => {
	const res = await api
		.post(`/api/posts/${postId}/addComment`)
		.send({
			data: {
				content: 'this is my first comment biatch',
			},
		})
		.auth(token, {
			type: 'bearer',
		})
		.expect(200)
	commentId = res.body.id
	expect(res.body.content).toEqual('this is my first comment biatch')
})

test(`user can't add a comment on an invalid post`, async () => {
	const res = await api
		.post(`/api/posts/34535234/addComment`)
		.send({
			data: {
				content: 'this is my second comment biatch',
			},
		})
		.auth(token, {
			type: 'bearer',
		})
		.expect(400)
	expect(res.text).toEqual('invalid comment or post id')
})

test('correct comments updates', async () => {
	const res = await api
		.put(`/api/posts/comment/${commentId}`)
		.send({
			updates: {
				content: 'updated comment biatch',
				id: 14444,
				user_id: 333,
			},
		})
		.auth(token, {
			type: 'bearer',
		})
		.expect(200)
	expect(res.body).toBeDefined()
	expect(res.body.content).toEqual('updated comment biatch')
	expect(res.body.id).toEqual(commentId)
	expect(res.body.author).not.toEqual(333)
	console.log('response: ', res.body)
})

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
		.expect(400)
	expect(res.text).toEqual('bad request')
})

test('get a full post', async () => {
	const res = await api
		.get(`/api/posts/${postId}`)
		.auth(token, {
			type: 'bearer',
		})
		.expect(200)
	console.log(res.body)
})

test('delete a valid post', async () => {
	const res = await api
		.delete(`/api/posts/${postId}`)
		.auth(token, {
			type: 'bearer',
		})
		.expect(200)
	expect(res.text).toEqual('post deleted successfully')
})
afterAll(async () => {
	await pool.end()
})
