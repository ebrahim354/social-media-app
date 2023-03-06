const router = require('express').Router();
const verifyToken = require('../utils/verifyToken');

router.post('/', async (req, res, next) => {
	try {
		const token = req.body.token;
		const payload = verifyToken(token);
		res.send({ payload });
	} catch (err) {
		next(err);
	}
});

module.exports = router;
