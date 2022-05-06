const router = require('express').Router();
const { userIdValidation, validatePost } = require('../middleware/validation');

const multer = require('multer');
const {
	createPost,
	updatePost,
	togglePostLike,
	getOnePost,
	getUserPosts,
	getTimeLine,
	deletePost,
	addComment,
	updateComment,
} = require('../db/postService');
const { publishPostNotification } = require('../db/notificationService');
const upload = multer({
	dest: '../../public/post',
});

//create a post
router.post(
	'/',
	userIdValidation,
	upload.single('file'),
	validatePost,
	async (req, res, next) => {
		const { description, img } = req.body;
		const userId = req.userId;
		const notification = `has created a new post!`;
		try {
			const post = await createPost({ description, img, userId });
			await publishPostNotification(post.id, userId, notification);
			res.status(200).json({
				data: {
					post,
				},
				errors: null,
			});
		} catch (err) {
			next(err);
		}
	}
);

//update a post
router.put('/:id', async (req, res, next) => {
	const postId = req.params.id;
	const updates = req.body.updates;
	const userId = req.body.userId;
	delete updates.id;
	delete updates.author;
	delete updates.created_at;
	try {
		const post = await updatePost(postId, userId, updates);
		res.status(200).json({
			data: {
				post,
			},
			errors: null,
		});
	} catch (err) {
		next(err);
	}
});

//like/dislike post
router.put('/:id/like', async (req, res, next) => {
	const postId = req.params.id;
	const userId = req.body.userId;
	const content = 'has liked a post that you are following!';
	try {
		const liked = await togglePostLike(userId, postId);
		if (liked) await publishPostNotification(postId, userId, content);
		res.status(200).json({
			data: {
				liked,
			},
			errors: null,
		});
	} catch (err) {
		next(err);
	}
});

//get a post
router.get('/:id', async (req, res, next) => {
	const postId = req.params.id;
	try {
		const post = await getOnePost(postId);
		res.status(200).json({
			data: {
				post,
			},
			errors: null,
		});
	} catch (err) {
		next(err);
	}
});

//get some user's posts
router.get('/:id/posts', async (req, res, next) => {
	const user = req.params.id;
	try {
		const posts = await getUserPosts(user);
		res.status(200).json({
			data: {
				posts,
			},
			errors: null,
		});
	} catch (err) {
		next(err);
	}
});

//gets timeline posts
router.get('/', async (req, res, next) => {
	const userId = req.body.userId;
	try {
		const timeline = await getTimeLine(userId);
		res.status(200).json({
			data: {
				timeline,
			},
			errors: null,
		});
	} catch (err) {
		next(err);
	}
});

//delete a post
router.delete('/:id', async (req, res, next) => {
	const postId = req.params.id;
	const userId = req.body.userId;
	try {
		result = await deletePost(postId, userId);
		res.status(200).json({
			data: {
				result,
			},
			errors: null,
		});
	} catch (err) {
		next(err);
	}
});

// add a comment on a post
router.post('/:id/addComment', async (req, res, next) => {
	const postId = req.params.id;
	const userId = req.body.userId;
	const notificationContent =
		'has commented on a post that your are following!';
	const { img, content } = req.body.data;

	try {
		const comment = await addComment({ userId, postId, img, content });
		await publishPostNotification(postId, userId, notificationContent);
		res.status(200).json({
			data: {
				comment,
			},
			errors: null,
		});
	} catch (err) {
		next(err);
	}
});
//update a comment
router.put('/comment/:id', async (req, res, next) => {
	const commentId = req.params.id;
	const updates = req.body.updates;
	const userId = req.body.userId;
	delete updates.user_id;
	delete updates.id;
	delete updates.post_id;
	delete updates.created_at;
	try {
		const comment = await updateComment(commentId, userId, updates);
		res.status(200).json({
			data: {
				comment,
			},
			errors: null,
		});
	} catch (err) {
		next(err);
	}
});

//like/dislike comment
router.put('/LikeComment/:id', async (req, res, next) => {
	const commentId = req.params.id;
	const userId = req.body.userId;
	try {
		// publish notifications later on.
		const liked = await toggleCommentLike(userId, commentId);
		res.status(200).json({
			data: {
				liked,
			},
			errors: null,
		});
	} catch (err) {
		next(err);
	}
});

module.exports = router;
