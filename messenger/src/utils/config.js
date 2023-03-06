require('dotenv').config();

const PORT = process.env.PORT;
const DB = process.env.DB_URL;
const REDIS = process.env.REDIS_URL;

module.exports = {
	PORT,
	DB,
	REDIS,
};
