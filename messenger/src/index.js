const http = require('http');
const App = require('./App');

const app = http.createServer(App);

app.listen(8080, () => {
	console.log('server is listening on port 8080');
});

module.exports = app;

require('./socketManager');
