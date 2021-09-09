const router = require('express').Router()
const User = require('../models/User')
const bcrypt = require('bcrypt')
const loggedIn = require('../utils/loggedIn')
const createToken = require('../utils/createToken')

//register
router.post('/register', async (req, res, next) => {
	try {
		// check if user is logged in or not
		if (loggedIn(req.token)) {
			return res.send('you are already logged in')
		}
		console.log('checked not logged in')
		const data = req.body
		const user = await User.findOne({ username: data.username })
		if (user) {
			res.send('this username is already taken try another one plz')
			return
		}

		const salt = await bcrypt.genSalt(10)
		const password = await bcrypt.hash(data.password, salt)
		// check if the username is taken
		console.log('checked unique')
		const newUser = await new User({
			username: data.username,
			password,
			email: data.email,
		})
		console.log('created the user')
		// we save the user take his id sign it with the private key
		// then send it back with the response object as the token property
		const dbUser = await newUser.save()
		const token = createToken(dbUser._id)
		res.status(200).json({
			user: dbUser,
			token,
		})
	} catch (err) {
		next(err)
	}
})

//login
router.post('/login', async (req, res, next) => {
	//check if he is already logged in
	if (loggedIn(req.token)) {
		return res.send('you are already loggedin')
	}
	const data = req.body
	try {
		const user = await User.findOne({ username: data.username })
		console.log(user)
		if (!user) {
			console.log('invalid username')
			res.status(400).send('invalid username or password')
			return
		}
		const passwordMatch = await bcrypt.compare(data.password, user.password)
		if (!passwordMatch) {
			console.log('invlaid password')
			res.status(400).send('invalid username or password')
			return
		}
		const token = createToken(user._id)
		res.status(200).json({
			user,
			token,
		})
	} catch (err) {
		next(err)
	}
})

module.exports = router
