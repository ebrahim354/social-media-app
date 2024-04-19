require('dotenv').config();

const PORT = process.env.PORT;
const DB = process.env.DB_URL;
const REDIS = process.env.REDIS_URL;
const BUCKET=process.env.CYCLIC_BUCKET_NAME;
const MY_URL=process.env.MY_URL;

module.exports = {
	PORT,
	DB,
	REDIS,
    BUCKET,
    MY_URL,
};
