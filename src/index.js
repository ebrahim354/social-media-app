const { PORT } = require('./utils/config');
const client = require('./NotificationPublisher');

const App = require('./App');
const http = require('http');
const server = http.createServer(App);

const main = async () => {
	await client.connect();

	server.listen(PORT, () => {
		console.log(`listening on port ${PORT}`);
	});
};

main();
