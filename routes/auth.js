const router = require('express').Router();
const bcrypt = require('bcrypt');
const loggedIn = require('../utils/loggedIn');
const createToken = require('../utils/createToken');
const { query } = require('../db');

//register
router.post('/register', async (req, res, next) => {
	try {
		// check if user is logged in or not
		if (loggedIn(req.token)) {
			return res.send('you are already logged in');
		}
		// console.log('checked not logged in')
		const data = req.body;
		const {
			rows: [user],
		} = await query('select username from users where username = $1', [
			data.username,
		]);
		if (user) {
			// console.log('found rows: ', user)
			res
				.status(400)
				.send('this username is already taken try another one plz');
			return;
		}
		// console.log('checked unique')

		const salt = await bcrypt.genSalt(10);
		const password = await bcrypt.hash(data.password, salt);

		// we save the user take his id sign it with the private key
		// then send it back with the response object as the token property
		const {
			rows: [dbUser],
		} = await query(
			'insert into users(username, password, email) values($1, $2, $3) returning *',
			[data.username, password, data.email]
		);
		// console.log('created the user', dbUser)
		dbUser.friends = [];
		dbUser.friend_requests = [];
		const token = createToken(dbUser.id);
		res.status(200).json({
			user: dbUser,
			token,
		});
	} catch (err) {
		next(err);
	}
});

//login
router.post('/login', async (req, res, next) => {
	//check if he is already logged in
	if (loggedIn(req.token)) {
		return res.send('you are already loggedin');
	}
	const data = req.body;
	try {
		const {
			rows: [user],
		} = await query(
			`select u1.*, 
		ARRAY_AGG('{ "username": "' || u2.username || '","profile_picture": "' || u2.profile_picture || '" }')  friends, 
		ARRAY_AGG('{ "username": "' || u3.username || '","profile_picture": "' || u3.profile_picture || '" }')  friend_requests 
		from users u1
		left join friendship f on u1.id in (f.user1_id, f.user2_id) 
		left join users u2 on (u2.id in (f.user1_id, f.user2_id) and u2.id != u1.id)
		left join friend_request f2 on u1.id = f2.receiver 
		left join users u3 on f2.sender = u3.id
		where u1.username = $1
		group by u1.id;`,
			[data.username]
		);
		// console.log('user: ', user)
		if (!user) {
			// console.log('invalid username')
			res.status(400).send('invalid username or password');
			return;
		}
		const passwordMatch = await bcrypt.compare(data.password, user.password);
		if (!passwordMatch) {
			// console.log('invlaid password')
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
