const { PORT } = require('./utils/config');
const client = require('./NotificationPublisher');
const initDB = require('./models/init');

const App = require('./App');
const http = require('http');
const server = http.createServer(App);

const main = async () => {
	await client.connect();
	await initDB();

	server.listen(PORT, () => {
		console.log(`listening on port ${PORT}`);
	});
};

main();
