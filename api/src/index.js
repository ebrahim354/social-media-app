const { PORT } = require('./utils/config');
const initDB = require('./models/init');

const App = require('./App');
const http = require('http');
const server = http.createServer(App);

const webSocketServer = require('websocket').server;
const messageHandler = require('./socketHandlers/messageHandler');
const initHandler = require('./socketHandlers/initHandler');
const {notificationSeen} = require('./socketHandlers/notificationsHandler');
const verifyToken = require('./utils/verifyToken');
const openConvHandler = require('./socketHandlers/openConvHandler');

const main = async () => {
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
				const payload = verifyToken(req.data.token);
				const userId = payload.sub;
				if (req.method == 'AUTHENTICATE') {
					await initHandler(userId, connection);
				} else if (req.method == 'SEND_MESSAGE') {
					await messageHandler(
						userId,
						req.data.conversationId,
						req.data.content
					);
				} else if(req.method == 'OPEN_CONVERSATION'){
					await openConvHandler(
						userId,
						req.data.conversationId
					);
				} else if(req.method == 'NOTIFICATION_SEEN'){
					await notificationSeen(userId, req.data.notificationId);
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
