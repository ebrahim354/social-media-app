const router = require('express').Router();
const bcrypt = require('bcrypt');
const loggedIn = require('../utils/loggedIn');
const createToken = require('../utils/createToken');
const { userExists, insertUser, getFullUser } = require('../db/userService');

//register
router.post('/register', async (req, res, next) => {
	try {
		if (loggedIn(req.token)) {
			return res.send('you are already logged in');
		}
		const data = req.body;
		const user = await userExists(data);
		if (user) {
			res.status(400).send('Invalid Username or e-mail!');
			return;
		}
		const salt = await bcrypt.genSalt(10);
		const password = await bcrypt.hash(data.password, salt);
		const dbUser = await insertUser({
			username: data.username,
			password,
			email: data.email,
		});
		const token = createToken(dbUser.id);
		res.status(200).json({
			user: dbUser,
			token,
		});
	} catch (err) {
		console.log('error: ', err);
		next(err);
	}
});

//login
router.post('/login', async (req, res, next) => {
	if (loggedIn(req.token)) {
		return res.send('you are already loggedin');
	}
	const data = req.body;
	if ((!data.username || !data.email) && !data.password)
		return res.status(400).send('Invalid request!');

	try {
		const user = await getFullUser({
			username: data.username,
			email: data.email,
		});
		if (!user) {
			res.status(400).send('invalid username or password');
			return;
		}
		const passwordMatch = await bcrypt.compare(data.password, user.password);
		if (!passwordMatch) {
			res.status(400).send('invalid username or password');
			return;
		}
		const token = createToken(user.id);
		res.status(200).json({
			user,
			token,
		});
	} catch (err) {
		next(err);
	}
});

module.exports = router;
