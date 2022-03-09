const { Pool } = require('pg')

class DataBase {
	pool
	query
	constructor(credit) {
		this.pool = new Pool(credit)
	}
}

module.exports = DataBase
