const verifyToken = require('../utils/verifyToken')

const idValidation = (req, res, next) => {
	if (!req.params.id) {
		const error = new Error('cant fined id parameter')
		error.name = 'ValidationError'
		next(error)
	}
	next()
}
const updatesValidation = (req, res, next) => {
	if (!req.body.updates) {
		const error = new Error('cant fined updates object')
		error.name = 'ValidationError'
		next(error)
	}
	next()
}
const userIdValidation = (req, res, next) => {
	if (!req.body.userId) {
		const error = new Error('cant fined userId')
		error.name = 'ValidationError'
		next(error)
	}
	next()
}
const containsDesc = (req, res, next) => {
	if (!req.body.description) {
		const error = new Error('invalid post')
		error.name = 'ValidationError'
		next(error)
	}
	next()
}
// catches if the token is expired or false for the protected routs
const validateToken = (req, res, next) => {
	// assuming getToken is used before this and req.token is a defined string
	try {
		const payload = verifyToken(req.token, true)
		console.log(`payload: ${payload.sub}`)
		req.body.userId = payload.sub
	} catch (err) {
		next(err)
	}
	next()
}

module.exports = {
	idValidation,
	userIdValidation,
	updatesValidation,
	containsDesc,
	validateToken,
}
