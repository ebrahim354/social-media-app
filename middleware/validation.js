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
const accessValidation = (req, res, next) => {
	if (req.body.userId !== req.params.id) {
		const error = new Error('you can access your account only')
		error.name = 'AuthorizationError'
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

module.exports = {
	idValidation,
	accessValidation,
	userIdValidation,
	updatesValidation,
	containsDesc,
}
