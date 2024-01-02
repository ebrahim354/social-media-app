const { PORT } = require('./utils/config');
const client = require('./NotificationPublisher');
const initDB = require('./models/init');

const App = require('./App');
const http = require('http');
const server = http.createServer(App);

const webSocketServer = require('websocket').server;
const messageHandler = require('./socketHandlers/messageHandler');
const initHandler = require('./socketHandlers/initHandler');
const notificationsHandler = require('./socketHandlers/notificationsHandler');
const verifyToken = require('./utils/verifyToken');
// const { createClient } = require('redis');
// const { REDIS } = require('./utils/config');

const main = async () => {
	await client.connect();
	await initDB();

	server.listen(PORT, () => {
		console.log(`listening on port ${PORT}`);
	});

	const socketServer = new webSocketServer({
		httpServer: server,
	});

	// socket handlers
	socketServer.on('request', request => {
		const connection = request.accept(null, request.origin);
		console.log('connection accepted ');

		connection.on('open', () => {
			console.log('user connected');
		});


		connection.on('message', async msg => {
			try {
				const req = JSON.parse(msg.utf8Data);
				console.log('user request: ', req);
				const payload = verifyToken(req.data.token);
				console.log('user token', payload);
				const userId = payload.sub;
				if (req.method == 'AUTHENTICATE') {
					await initHandler(userId, connection);
				} else if (req.method == 'SEND_MESSAGE') {
					await messageHandler(
						userId,
						req.data.receiverId,
						req.data.content
					);
				}
			} catch (err) {
				console.log(err);
			}
		});

		connection.on('close', (reasonCode, description) => {
			console.log(
				`connection with: ${connection.remoteAddress} is closed now`
			);
		});
	});



};

main();
