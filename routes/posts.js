const router = require('express').Router()
const Post = require('../models/Post')
const User = require('../models/User')
const { userIdValidation, validatePost } = require('../middleware/validation')

const multer = require('multer')
const upload = multer({
	dest: 'public/post',
})

//create a post
router.post(
	'/',
	userIdValidation,
	upload.single('file'),
	validatePost,
	async (req, res, next) => {
		const data = req.body
		console.log('request body: ', req.body)
		try {
			const post = new Post({
				author: req.userId,
				description: data.description,
				img: data.img ? data.img : '',
			})
			const saved = await post.save()
			res.status(200).json(saved.toJSON())
		} catch (err) {
			next(err)
		}
	}
)
//update a post
router.put('/:id', async (req, res, next) => {
	const postId = req.params.id
	try {
		const post = await Post.findById(postId)
		if (!post) return res.status(404).send('post not found')
		if (post.author !== req.body.userId)
			return res.status(401).send('you can update your posts only')

		await post.updateOne(req.body.updates)
		res.status(200).send('post updated successfully')
	} catch (err) {
		next(err)
	}
})
//delete a post
router.delete('/:id', async (req, res, next) => {
	const postId = req.params.id
	try {
		const post = await Post.findById(postId)
		if (!post) return res.status(404).send('post not found')
		if (post.author !== req.body.userId)
			return res.status(403).send('you can delete your posts only')
		await post.delete()
		res.status(200).send('post deleted successfully')
	} catch (err) {
		next(err)
	}
})
//like post
router.put('/:id/like', async (req, res, next) => {
	try {
		const post = await Post.findById(req.params.id)
		if (!post) return res.status(404).send('post is not found')

		if (!post.likes.includes(req.body.userId)) {
			await post.updateOne({
				likes: post.likes.concat(req.body.userId),
			})
			// true means that the user hasn't liked the post and he just liked it
			res.status(200).send(true)
		} else {
			await post.updateOne({
				likes: post.likes.filter(i => i !== req.body.userId),
			})
			// false means that the user unliked the post
			res.status(200).send(false)
		}
	} catch (err) {
		next(err)
	}
})

//get some user's posts
router.get('/:id/posts', async (req, res, next) => {
	try {
		const user = await User.findById(req.params.id)
		const psts = await Post.find({ author: req.params.id })

		const myPosts = psts.map(post => {
			const { _id, __v, updatedAt, ...others } = post._doc
			return {
				...others,
				id: _id,
				author: {
					username: user.username,
					profilePicture: user.profilePicture,
					id: user._id,
				},
			}
		})
		res.status(200).json(myPosts)
	} catch (err) {
		next(err)
	}
})

//gets timeline posts
router.get('/', async (req, res, next) => {
	console.log(req.body.userId)
	try {
		const user = await User.findById(req.body.userId)

		// const myPosts = await Post.find({ author: req.body.userId }).populate(
		// 	'author',
		// 	{ username: 1, profilePicture: 1 }
		// )

		// you can do that or populate the psts with another query to the database this is better of course

		const psts = await Post.find({ author: req.body.userId })
		const myPosts = psts.map(post => {
			const { _id, __v, updatedAt, ...others } = post._doc
			return {
				...others,
				id: _id,
				author: {
					username: user.username,
					profilePicture: user.profilePicture,
					id: user._id,
				},
			}
		})
		// this did not work for some reason (search for it later)
		// myPosts.forEach(post => {
		// 	console.log(user.username, user.profilePicture)
		// 	const val = delete post.author
		// 	console.log('val: ', val)
		// 	// post.author = {
		// 	// }
		// 	console.log(post.author)
		// })
		let timeline = myPosts
		console.log(myPosts)
		const usersIds = user.following
		for (let id of usersIds) {
			console.log('start searching for posts')
			const posts = await Post.find({ author: id }).populate('author', {
				username: 1,
				profilePicture: 1,
			})
			// experimental
			timeline = timeline.concat(
				posts.map(post => {
					const { _id, __v, updatedAt, ...others } = post._doc
					return {
						...others,
						id: _id,
					}
				})
			)
			console.log('concated the found posts')
		}
		res.status(200).json(timeline)
	} catch (err) {
		next(err)
	}
})

//get a post
router.get('/:id', async (req, res, next) => {
	try {
		const post = await Post.findById(req.params.id)
		if (!post) return res.status(404).send('post is not found')
		res.status(200).json(post.toJSON())
	} catch (err) {
		next(err)
	}
})
module.exports = router
