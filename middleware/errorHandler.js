const errorHandler = (err, req, res, next) => {
	console.log(err)
	if (err.name === 'MongooseError')
		return res.status(500).send({ error: 'enternal server error' })
	if (err.name === 'ValidationError')
		return res.status(400).send({ error: err.message })
	next()
}

module.exports = errorHandler
