const router = require('express').Router()
const Post = require('../models/Post')
const User = require('../models/User')
const { userIdValidation, containsDesc } = require('../middleware/validation')

//create a post
router.post('/', userIdValidation, containsDesc, async (req, res, next) => {
	const data = req.body
	// add checking for userId later (being an actual user)
	try {
		const post = new Post({
			userId: data.userId,
			description: data.description,
			img: data.img ? data.img : '',
		})
		const saved = await post.save()
		res.status(200).json(saved)
	} catch (err) {
		next(err)
	}
})
//update a post
router.put('/:id', async (req, res, next) => {
	const postId = req.params.id
	try {
		const post = await Post.findById(postId)
		if (!post) return res.status(404).send('post not found')
		if (post.userId !== req.body.userId)
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
		if (post.userId !== req.body.userId)
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
			res.status(200).send('you liked the post')
		} else {
			await post.updateOne({
				likes: post.likes.filter(i => i !== req.body.userId),
			})
			res.status(200).send('you unliked the post')
		}
	} catch (err) {
		next(err)
	}
})
//get a post
router.get('/:id', async (req, res, next) => {
	try {
		const post = await Post.findById(req.params.id)
		if (!post) return res.status(404).send('post is not found')
		res.status(200).json(post)
	} catch (err) {
		next(err)
	}
})
//get timeline posts
router.get('/timeline/:userId', async (req, res, next) => {
	try {
		const user = await User.findById(req.params.userId)
		const myPosts = await Post.find({ userId: req.params.userId })
		let timeline = myPosts
		console.log(myPosts)
		const usersIds = user.following
		for (let id of usersIds) {
			console.log('start searching for posts')
			const posts = await Post.find({ userId: id })
			timeline = timeline.concat(posts)
			console.log('concated the found posts')
		}
		res.status(200).json(timeline)
	} catch (err) {
		next(err)
	}
})

module.exports = router
