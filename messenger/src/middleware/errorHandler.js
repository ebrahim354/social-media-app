const {
	CODE_INCORRECT_CREDITS,
	CODE_INVALID_REQUEST,
	CODE_UNAUTHORIZED,
	CODE_NOT_FOUND,
} = require('../constants');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
	console.log('from error handler: ', err.message);
	if (err.message === 'Invalid input')
		return res.status(CODE_INVALID_REQUEST).json({
			data: null,
			errors: err.message,
		});
	if (err.message === 'unAuthorized!') {
		return res.status(CODE_UNAUTHORIZED).json({
			data: null,
			errors: err.message,
		});
	}
	if (err.message === 'NOT FOUND!') {
		return res.status(CODE_NOT_FOUND).json({
			data: null,
			errors: err.message,
		});
	}
	if (err.name === 'Invalid username or password')
		return res.status(CODE_INCORRECT_CREDITS).json({
			data: null,
			errors: err.name,
		});
	if (err.name === 'ValidationError')
		return res.status(400).json({ error: err.message });
	if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError')
		return res.status(401).json({ error: 'invalid token' });

	return res.status(CODE_INVALID_REQUEST).json({
		data: null,
		errors: err.message,
	});
};

module.exports = errorHandler;
