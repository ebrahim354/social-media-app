const jwt = require('jsonwebtoken')
const path = require('path')
const fs = require('fs')
const publicKey = fs.readFileSync(
	path.resolve(__dirname, '../..') + '/publicKey.pem'
)
const verifyToken = (token, catchErr) => {
	let payload
	try {
		payload = jwt.verify(token, publicKey)
	} catch (err) {
		if (catchErr) {
			console.log(token)
			throw err
		}
	}
	return payload && payload.sub && Date.now() < payload.exp * 1000
		? payload
		: null
	// check if the payload is valid and has not expired yet
}

module.exports = verifyToken
