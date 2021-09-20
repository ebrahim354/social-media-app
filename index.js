const { PORT } = require('./utils/config')

const App = require('./App')
const http = require('http')
const server = http.createServer(App)

server.listen(PORT, () => {
	console.log(`listening on port ${port}`)
})
