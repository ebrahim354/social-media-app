require('dotenv').config()

const PORT = process.env.PORT
const DB = process.env.DB_URL

module.exports = {
	PORT,
	DB,
}
