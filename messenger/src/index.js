const http = require('http');
const App = require('./App');
const { PORT } = require('./utils/config');

const app = http.createServer(App);

app.listen(PORT, () => {
	console.log(`server is listening on port ${PORT}`);
});

module.exports = app;

require('./socketManager');
