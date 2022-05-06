const verifyToken = require('./verifyToken')

const loggedIn = token => {
	const validToken = verifyToken(token, false)
	return validToken ? validToken : null
}

module.exports = loggedIn
