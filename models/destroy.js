const { query, pool } = require('../db')

const destroy = async () => {
	const tables = [
		'friendship',
		'friend_request',
		'comment_likes',
		'comments',
		'post_likes',
		'posts',
		'users',
	]

	for (let table of tables) {
		try {
			await query(`drop table ${table};`)
		} catch (err) {
			console.log('error!')
		}
		console.log('dropped table: ', table)
	}
	await pool.end()
}

destroy()

module.exports = destroy
