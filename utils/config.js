require('dotenv').config();

const PORT = process.env.PORT;
const DB = process.env.DB_URL;
const SOCKET_PORT = process.env.SOCKET_PORT;

module.exports = {
	PORT,
	DB,
	SOCKET_PORT,
};
