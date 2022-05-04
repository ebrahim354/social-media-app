const { PORT, SOCKET_PORT } = require('./utils/config');

const io = require('socket.io')(SOCKET_PORT, {
	cors: {
		origin: ['http://localhost:3000'],
	},
});

io.on('connection', socket => {
	console.log('someone connected: ', socket.id);
});

const App = require('./App');
const http = require('http');
const server = http.createServer(App);

server.listen(PORT, () => {
	console.log(`listening on port ${PORT}`);
});
