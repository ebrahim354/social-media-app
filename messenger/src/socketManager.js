const webSocketServer = require('websocket').server;
const messageHandler = require('./socketHandlers/messageHandler');
const initHandler = require('./socketHandlers/initHandler');
const notificationsHandler = require('./socketHandlers/notificationsHandler');
const verifyToken = require('./utils/verifyToken');
const app = require('./index');
const { createClient } = require('redis');
const { REDIS } = require('./utils/config');

const socketServer = new webSocketServer({
	httpServer: app,
});

const client = createClient({
	url: REDIS,
});

client.on('error', err => console.log('redis error: ', err));

const main = async () => {
	try {
		// notification handler.
		await client.connect();
		client.subscribe('NOTIFICATIONS', message => {
			// format:
			// users => to notify
			// content => string
			const data = JSON.parse(message);
			const { users, content } = data;
			notificationsHandler(users, content);
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
					const payload = verifyToken(req.token);
					const userId = payload.sub;
					if (req.method == 'AUTHENTICATE') {
						await initHandler(userId, connection);
					} else if (req.method == 'SEND_MESSAGE') {
						await messageHandler(
							userId,
							req.data.conversationId,
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
	} catch (err) {
		console.log(err);
	}
};

main();
module.expots = main;
