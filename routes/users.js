const router = require('express').Router()
const User = require('../models/User')
const bcrypt = require('bcrypt')
const {
	idValidation,
	updatesValidation,
	userIdValidation,
	accessValidation,
} = require('../middleware/validation')

//get all users for testing
router.get('/all', async (req, res, next) => {
	try {
		const users = await User.find({})
		res.status(200).json(users)
	} catch (err) {
		next(err)
	}
})

//update user
router.put(
	'/:id',
	idValidation,
	updatesValidation,
	userIdValidation,
	accessValidation,
	async (req, res, next) => {
		const id = req.params.id
		const updates = req.body.updates
		try {
			//check for updating the password requests
			if (updates.password) {
				const salt = await bcrypt.genSalt(10)
				updates.password = await bcrypt.hash(updates.password, salt)
				console.log(updates.password)
			}
			const user = await User.findByIdAndUpdate(id, updates, { new: true })
			// if (!user) return res.status(404).send('not found')
			res.status(200).json(user)
		} catch (err) {
			next(err)
		}
	}
)
//delete user
router.delete(
	'/:id',
	idValidation,
	userIdValidation,
	accessValidation,
	async (req, res, next) => {
		const id = req.params.id
		try {
			const user = await User.findByIdAndRemove(id)
			res.status(200).send('user deleted successfully')
		} catch (err) {
			next(err)
		}
	}
)
//get a user
router.get('/:id', async (req, res, next) => {
	const id = req.params.id
	try {
		const user = await User.findById(id)
		if (!user) {
			return res.status(404).send('user not found')
		}
		const { password, updatedAt, ...other } = user._doc
		res.status(200).json(other)
	} catch (err) {
		next(err)
	}
})
//follow a user

router.put(
	'/:id/follow',
	idValidation,
	userIdValidation,
	async (req, res, next) => {
		const id = req.params.id
		const userId = req.body.userId

		if (id === userId)
			return res.status(403).send("you can't follow yourself :(")

		try {
			const follower = await User.findById(userId)
			const followee = await User.findById(id)

			if (!(follower && followee)) return res.status(400).send('invalid ids')

			if (follower.following.includes(id))
				return res.status(403).send('you are already following this user')

			await followee.updateOne({
				followers: followee.followers.concat(userId),
			})
			await follower.updateOne({
				following: follower.following.concat(id),
			})
			res.status(200).send('followed successfully')
		} catch (err) {
			next(err)
		}
	}
)

//unfollow a user

router.put(
	'/:id/unfollow',
	idValidation,
	userIdValidation,
	async (req, res, next) => {
		const id = req.params.id
		const userId = req.body.userId

		if (id === userId)
			return res.status(403).send("you can't unfollow yourself :(")

		try {
			const follower = await User.findById(userId)
			const followee = await User.findById(id)

			if (!(follower && followee)) return res.status(400).send('invalid ids')

			if (!follower.following.includes(id))
				return res.status(403).send("you can't unfollow this user")

			await followee.updateOne({
				followers: followee.followers.filter(f => f !== userId),
			})
			await follower.updateOne({
				following: follower.following.filter(f => f !== id),
			})
			res.status(200).send('unfollowed successfully')
		} catch (err) {
			next(err)
		}
	}
)

module.exports = router
