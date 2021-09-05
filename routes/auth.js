const router = require('express').Router()
const User = require('../models/User')
const bcrypt = require('bcrypt')

//register
router.post('/register', async (req, res, next) => {
	const data = req.body
	const salt = await bcrypt.genSalt(10)
	const password = await bcrypt.hash(data.password, salt)

	const newUser = await new User({
		username: data.username,
		password,
		email: data.email,
	})

	try {
		const user = await newUser.save()
		res.status(200).send(user)
	} catch (err) {
		next(err)
	}
})

//login
router.post('/login', async (req, res, next) => {
	const data = req.body
	console.log(data)
	try {
		const user = await User.findOne({ username: data.username })
		console.log(user)
		if (!user) {
			console.log('invalid username')
			res.status(400).end()
			return
		}
		const passwordMatch = await bcrypt.compare(data.password, user.password)
		if (!passwordMatch) {
			console.log('invlaid password')
			res.status(400).end()
			return
		}
		console.log(passwordMatch)
		res.status(200).send(`user: ${user.username} is now logged in`)
	} catch (err) {
		next(err)
	}
})

module.exports = router
