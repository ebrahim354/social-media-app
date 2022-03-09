const { Pool } = require('pg')

const pool = new Pool({
	user: 'postgres',
	password: 'a15908236',
	host: 'localhost',
	database: 'social_media',
	port: 5432,
})

module.exports = {
	query: (text, params) => pool.query(text, params),
	pool: pool,
}
