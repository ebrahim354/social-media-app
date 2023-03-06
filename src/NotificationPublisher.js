const { createClient } = require('redis');
const { REDIS } = require('./utils/config');

const client = createClient({
	url: REDIS,
});

module.exports = client;
