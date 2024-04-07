const fs = require('fs');
const path = require('path');

const verifyToken = require('../utils/verifyToken');
const { BUCKET } = require('../utils/config');

const idValidation = (req, res, next) => {
	if (!req.params.id) {
		const error = new Error('cant find id parameter');
		error.name = 'ValidationError';
		next(error);
	}
	next();
};
const updatesValidation = (req, res, next) => {
	if (!req.body.updates) {
		const error = new Error('cant find updates object');
		error.name = 'ValidationError';
		next(error);
	}
	next();
};
const userIdValidation = (req, res, next) => {
	if (!req.body.userId) {
		const error = new Error('cant find userId');
		error.name = 'ValidationError';
		next(error);
	}
	// take a coppy in case other middlewares change the body object
	req.userId = req.body.userId;
	next();
};


const validateImg = (req, res, next) => {
	// if the post is empty rais an error
	if (!req.file) {
		const error = new Error('invalid img');
		error.name = 'ValidationError';
		return next(error);
	}
    // if we are using s3 return don't save to the local file system.
    if(BUCKET) return next();
	// vallidate and save the img if there is any
	const tmpPath = req.file.path;
	const imgPath = path.join(
		'/public/post',
		Date.now() + req.file.originalname
	);
	const newPath = path.join(__dirname, '../..', imgPath);
	const extName = path.extname(req.file.originalname).toLowerCase();
	// check for accepted extentions only
	if (extName !== '.png' && extName !== '.jpeg' && extName !== '.jpg') {
		fs.unlinkSync(tmpPath);
		const error = new Error('invalid img');
		error.name = 'ValidationError';
		return next(error);
	}
	// the img ext is accepted rename it
	fs.renameSync(tmpPath, newPath);
	req.body.img = imgPath;
	next();
};

const validatePost = (req, res, next) => {
	// if the post is empty rais an error
	if (!req.file && !req.body.description) {
		const error = new Error('invalid post');
		error.name = 'ValidationError';

		return next(error);
	}
	// vallidate and save the img if there is any
	if (req.file && !BUCKET) {
		const tmpPath = req.file.path;
		const imgPath = path.join(
			'/public/post',
			Date.now() + req.file.originalname
		);
		const newPath = path.join(__dirname, '../..', imgPath);
		const extName = path.extname(req.file.originalname).toLowerCase();
		// check for accepted extentions only
		if (extName !== '.png' && extName !== '.jpeg' && extName !== '.jpg') {
			fs.unlinkSync(tmpPath);

			const error = new Error('invalid post');
			error.name = 'ValidationError';

			return next(error);
		}
		// the img ext is accepted rename it
		fs.renameSync(tmpPath, newPath);
		req.body.img = imgPath;
	}

	next();
};
// catches if the token is expired or false for the protected routs
const validateToken = (req, res, next) => {
	// assuming getToken is used before this and req.token is a defined string
	try {
		const payload = verifyToken(req.token, true);
		// console.log(`payload: ${payload.sub}`)
		req.body.userId = payload.sub;
	} catch (err) {
		// console.log(err)
		next(err);
	}
	next();
};

module.exports = {
	idValidation,
	userIdValidation,
	updatesValidation,
	validatePost,
	validateToken,
	validateImg,
};
