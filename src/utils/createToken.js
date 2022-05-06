const jwt = require('jsonwebtoken')
const fs = require('fs')
const path = require('path')
// console.log(path.resolve(__dirname, '..'))
const privateKey = fs.readFileSync(
	path.resolve(__dirname, '../..') + '/privateKey.pem'
)

const createToken = (id, expiresIn) => {
	const token = jwt.sign(
		{
			sub: id,
		},
		privateKey,
		{ algorithm: 'RS256', expiresIn: expiresIn ? expiresIn : 5 * 15 * 4 * 24 }
	)
	return token
}

module.exports = createToken
