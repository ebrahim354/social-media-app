const router = require('express').Router()
const User = require('../models/User')
const bcrypt = require('bcrypt')
const {
	idValidation,
	updatesValidation,
	userIdValidation,
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

//get the user on the token (data for login)
router.get('/', async (req, res, next) => {
	const id = req.body.userId
	console.log(id)
	try {
		const user = await User.findById(id)
			.populate('friendRequests', {
				username: 1,
				profilePicture: 1,
			})
			.populate('friends', {
				username: 1,
				profilePicture: 1,
			})
		if (!user) {
			return res.status(404).send('user not found')
		}
		// const { password, updatedAt, ...other } = user._doc
		res.status(200).json(user.toJSON())
	} catch (err) {
		next(err)
	}
})

//update user
router.put('/', updatesValidation, userIdValidation, async (req, res, next) => {
	const id = req.body.userId
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
		res.status(200).json(user.toJSON())
	} catch (err) {
		next(err)
	}
})
//delete user
router.delete('/', userIdValidation, async (req, res, next) => {
	const id = req.body.userId
	try {
		const user = await User.findByIdAndRemove(id)
		res.status(200).send('user deleted successfully')
	} catch (err) {
		next(err)
	}
})
//get a user
router.get('/:id', async (req, res, next) => {
	const id = req.params.id
	try {
		const user = await User.findById(id)
		if (!user) {
			return res.status(404).send('user not found')
		}
		// const { password, updatedAt, ...other } = user._doc
		// you don't need that information
		delete user.friendRequests
		res.status(200).json(user.toJSON())
	} catch (err) {
		next(err)
	}
})

// accept a friend request
router.put('/acceptFriendRequest/:id', async (req, res, next) => {
	const userId = req.body.userId
	const id = req.params.id
	if (userId === id)
		return res
			.status(403)
			.send("you can't accept friend requests form yourself")

	try {
		const user = await User.findById(userId)
		const requester = await User.findById(id)

		if (!(user && requester)) return res.status(403).send('invalid ids')

		if (!user.friendRequests.includes(id))
			return res
				.status(403)
				.send("you can't accept friend request from this user")

		await user.updateOne({
			friendRequests: user.friendRequests.filter(i => i !== id),
			friends: user.friends.concat(id),
		})

		await requester.updateOne({
			friends: requester.friends.concat(userId),
		})
		res.status(200).send('friend request accepted')
	} catch (err) {
		next(err)
	}
})

// send / delete friend request to a user
router.put(
	'/friendRequest/:id',
	idValidation,
	userIdValidation,
	async (req, res, next) => {
		const id = req.params.id
		const userId = req.body.userId

		console.log(userId)
		if (id === userId)
			return res
				.status(403)
				.send("you can't send friend request to yourself :(")

		try {
			const sender = await User.findById(userId)
			const receiver = await User.findById(id)

			if (!(sender && receiver)) {
				console.log('invalid ids')
				return res.status(400).send('invalid ids')
			}

			if (sender.friends.includes(id))
				return res.status(403).send('you are already friends')

			if (!receiver.friendRequests.includes(userId)) {
				await receiver.updateOne({
					friendRequests: receiver.friendRequests.concat(userId),
				})
				res.status(200).send('friend request has been sent')
			} else {
				await receiver.updateOne({
					friendRequests: receiver.friendRequests.filter(i => i !== userId),
				})
				res.status(200).send('friend request is removed')
			}
		} catch (err) {
			next(err)
		}
	}
)

//unfriend a user
router.put(
	'/unfriend/:id',
	idValidation,
	userIdValidation,
	async (req, res, next) => {
		const id = req.params.id
		const userId = req.body.userId

		if (id === userId)
			return res.status(403).send("you can't unfriend yourself :(")

		try {
			const sender = await User.findById(userId)
			const receiver = await User.findById(id)

			if (!(sender && receiver)) return res.status(400).send('invalid ids')

			if (!receiver.friends.includes(userId)) {
				return res.status(403).send("you can't unfriend this user")
			}

			await receiver.updateOne({
				friends: receiver.friends.filter(f => f !== userId),
			})
			await sender.updateOne({
				friends: sender.friends.filter(f => f !== id),
			})
			res.status(200).send('unfriended successfully')
		} catch (err) {
			next(err)
		}
	}
)

module.exports = router
