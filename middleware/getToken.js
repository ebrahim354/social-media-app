const getToken = (req, res, next) => {
	// the token should be in the header Athorization with bearer prefix
	const auth = req.header('Authorization')
	if (auth && auth.startsWith('Bearer ')) {
		req.token = auth.substr(7)
	} else {
		req.token = null
	}
	return next()
}

module.exports = getToken
