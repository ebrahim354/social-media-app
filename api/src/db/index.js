const { Pool } = require('pg');
const { DB } = require('../utils/config');

const pool = new Pool({
	connectionString: DB,
});

module.exports = {
	query: (text, params) => pool.query(text, params),
	pool: pool,
};
