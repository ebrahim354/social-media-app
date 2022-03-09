const router = require('express').Router();
const { userIdValidation, validatePost } = require('../middleware/validation');
const { objectToParams } = require('../utils/dynamicSql');

const multer = require('multer');
const { query, pool } = require('../db');
const upload = multer({
	dest: 'public/post',
});

//create a post
router.post(
	'/',
	userIdValidation,
	upload.single('file'),
	validatePost,
	async (req, res, next) => {
		const data = req.body;
		console.log('request body: ', req.body);
		try {
			const {
				rows: [post],
			} = await query(
				`insert into posts(author, description, img) values($1, $2, $3) returning *`,
				[req.userId, data.description, data.img ? data.img : '']
			);
			// const post = new Post({
			// 	author: req.userId,
			// 	description: data.description,
			// 	img: data.img ? data.img : '',
			// })
			// const saved = await post.save()
			res.status(200).json(post);
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
	if (updates.id) {
		delete updates.id;
	}
	if (updates.author) {
		delete updates.author;
	}
	try {
		updates.updated_at = new Date();
		const [result, vals, counter] = objectToParams(updates);
		const {
			rows: [post],
		} = await query(
			`update posts set ${result} where id = $${counter} and author = $${
				counter + 1
			} returning *;`,
			[...vals, postId, userId]
		);
		// const post = await Post.findById(postId)
		if (!post) return res.status(404).send('post not found');
		// if (post.author !== req.body.userId)
		// 	return res.status(401).send('you can update your posts only')

		// await post.updateOne(req.body.updates)
		res.status(200).json(post);
	} catch (err) {
		res.status(400).send('bad request');
	}
});

//like/dislike post
router.put('/:id/like', async (req, res, next) => {
	const postId = req.params.id;
	const userId = req.body.userId;
	try {
		const {
			rows: [post],
		} = await query(
			`insert into post_likes(user_id, post_id) values($1, $2) 
										on conflict(user_id, post_id)
										do  update set liked = not post_likes.liked 
										where post_likes.user_id = $1 and post_likes.post_id = $2
										returning liked`,
			[userId, postId]
		);
		// console.log('post like:', post.liked)
		// const post = await Post.findById(req.params.id)

		// if (!post.likes.includes(req.body.userId)) {
		// 	await post.updateOne({
		// 		likes: post.likes.concat(req.body.userId),
		// 	})
		// } else {
		// 	await post.updateOne({
		// 		likes: post.likes.filter(i => i !== req.body.userId),
		// 	})

		// true means that the user just liked the post it
		// false means that the user unliked the post
		res.status(200).json(post.liked);
	} catch (err) {
		// console.log('error: ', err)
		if (err.code == 23503) return res.status(404).send('post is not found');
		next(err);
	}
});

// add a comment on a post
router.post('/:id/addComment', async (req, res, next) => {
	const postId = req.params.id;
	const userId = req.body.userId;
	const data = req.body.data;
	console.log('userid: ', userId);

	try {
		const {
			rows: [comment],
		} = await query(
			`insert into comments(post_id, user_id, content, img) values($1, $2, $3, $4) returning *`,
			[postId, userId, data.content, data.img ? data.img : '']
		);
		res.status(200).json(comment);
	} catch (err) {
		// console.log('error: ', err)
		return res.status(400).send('invalid comment or post id');
	}
});
//update a comment
router.put('/comment/:id', async (req, res, next) => {
	const commentId = req.params.id;
	const updates = req.body.updates;
	const userId = req.body.userId;
	if (updates.id) {
		delete updates.id;
	}
	if (updates.user_id) {
		delete updates.user_id;
	}
	try {
		updates.updated_at = new Date();
		const [result, vals, counter] = objectToParams(updates);
		const {
			rows: [comment],
		} = await query(
			`update comments set ${result} where id = $${counter} and user_id = $${
				counter + 1
			} returning *;`,
			[...vals, commentId, userId]
		);
		if (!comment) return res.status(404).send('comment not found');
		res.status(200).json(comment);
	} catch (err) {
		// console.log('errorrrr: ', err)
		return res.status(400).send('bad request');
	}
});

//get a post
// add the comment likes functionality later
router.get('/:id', async (req, res, next) => {
	const postId = req.params.id;
	// const userId = req.body.userId
	try {
		const {
			rows: [post],
		} = await query(
			`select p.*, json_build_object('username', author.username, 'profilePicture', author.profile_picture) as user,
		coalesce (array_agg(json_build_object('username', u.username, 'profilePicture', u.profile_picture)) 
		filter (where u.username is not null), '{}') as likes,
		coalesce (array_agg(
			json_build_object
			('username', u2.username, 'profilePicture', u2.profile_picture,
			 'content', c.content, 'img', c.img, 'createdAt', c.created_at, 'updatedAt', c.updated_at)
		) 
		filter (where u2.username is not null), '{}') as comments
		from posts p
		join users author on  p.author = author.id
		left join post_likes pl on p.id = pl.post_id
		left join users u on pl.user_id = u.id
		left join comments c on p.id = c.post_id
		left join users u2 on c.user_id = u2.id
		where p.id = $1 
		group by p.id, author.username, author.profile_picture;
		`,
			[postId]
		);
		// delete post.author
		console.log('post: ', post);
		if (!post) return res.status(404).send('post is not found');
		res.status(200).json(post);
	} catch (err) {
		console.log('err: ', err);
		next(err);
	}
});

//get some user's posts
router.get('/:id/posts', async (req, res, next) => {
	const user = req.params.id;
	try {
		const { rows: posts } = await query(
			`select p.*, json_build_object('username', author.username, 'profilePicture', author.profile_picture) as user,
			coalesce (array_agg(json_build_object('username', u.username, 'profilePicture', u.profile_picture)) 
			filter (where u.username is not null), '{}') as likes,
			coalesce (array_agg(
				json_build_object
				('username', u2.username, 'profilePicture', u2.profile_picture,
				'content', c.content, 'img', c.img, 'createdAt', c.created_at, 'updatedAt', c.updated_at)
			) 
			filter (where u2.username is not null), '{}') as comments
			from posts p
			join users author on  p.author = author.id
			left join post_likes pl on p.id = pl.post_id
			left join users u on pl.user_id = u.id
			left join comments c on p.id = c.post_id
			left join users u2 on c.user_id = u2.id
			where p.author = $1 
			group by p.id, author.username, author.profile_picture;`,
			[user]
		).catch(err => {
			console.log('query error: ', err);
		});
		res.status(200).json(posts);
	} catch (err) {
		console.log('caught an error', err);
		return res.status(400).send('invalid user user id');
	}
});

//gets timeline posts
router.get('/', async (req, res, next) => {
	const userId = req.body.userId;
	try {
		const { rows: timeline } = await query(
			`
				select p.*, json_build_object('username', author.username, 'profilePicture', author.profile_picture) as user,
			coalesce (array_agg(json_build_object('username', u.username, 'profilePicture', u.profile_picture)) 
			filter (where u.username is not null), '{}') as likes,
			coalesce (array_agg(
				json_build_object
				('username', u2.username, 'profilePicture', u2.profile_picture,
				'content', c.content, 'img', c.img, 'createdAt', c.created_at, 'updatedAt', c.updated_at)
			) 
			filter (where u2.username is not null), '{}') as comments
			from posts p
			join users author on  p.author = author.id
			left join post_likes pl on p.id = pl.post_id
			left join users u on pl.user_id = u.id
			left join comments c on p.id = c.post_id
			left join users u2 on c.user_id = u2.id
			where p.author = $1 or p.author in (
				select 
				case  
					when user1_id = p.author then user2_id 
					when user2_id = p.author then user1_id
				end
				from friendship where p.author in (user1_id, user2_id)
			)
			group by p.id, author.username, author.profile_picture;	`,
			[userId]
		).catch(err => {
			console.log('query error', err);
		});
		res.status(200).json(timeline);
	} catch (err) {
		next(err);
	}
});

//delete a post
router.delete('/:id', async (req, res, next) => {
	const postId = req.params.id;
	const userId = req.body.userId;
	const client = await pool.connect();
	try {
		const {
			rows: [post],
		} = await client.query(
			'select * from posts where id = $1 and author = $2',
			[postId, userId]
		);

		if (!post || post.id != postId)
			return res.status(401).send(`you can't delete this post`);
		else {
			await client.query('begin');
			await client.query(
				`delete from comment_likes where comment_id in (
			select id from comments where post_id = $1)`,
				[postId]
			);
			await client.query(`delete from comments where post_id = $1`, [postId]);
			await client.query(`delete from post_likes where post_id = $1`, [postId]);
			await client.query(`delete from posts where id = $1`, [postId]);
			await client.query(`commit`);

			res.status(200).send('post deleted successfully');
		}
	} catch (err) {
		console.log(err);
		await client.query('rollback');
		return res.status(404).send('post not found');
	} finally {
		client.release();
	}
});

module.exports = router;
