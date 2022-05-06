const { query, pool } = require('../db');
const { objectToParams } = require('./utils/dynamicSql');

const createPost = async ({ description, userId, img }) => {
	if (!img) img = '';
	if (!description) description = '';
	const client = await pool.connect();
	try {
		await client.query('begin');
		const {
			rows: [post],
		} = await client.query(
			`insert into posts(author, description, img) values($1, $2, $3) returning *`,
			[userId, description, img ? img : '']
		);
		// subscribe friends;
		await client.query(
			`insert into posts_subscribers(post_id, user_id)
			 select $1, users.user_id from (
				select 
				case  
					when user1_id = $2 then user2_id 
					when user2_id = $2 then user1_id
				end user_id
				from friendship
				where $2 in (user1_id, user2_id)
				) users;
			`,
			[post.id, userId]
		);
		await client.query(`commit`);
		return post;
	} catch (err) {
		console.log('create post', err);
		await client.query(`rollback`);
		throw new Error('Invalid input');
	} finally {
		await client.release();
	}
};

const updatePost = async (postId, userId, updates) => {
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
		return post;
	} catch (err) {
		throw new Error('Invalid input');
	}
};

const postQuery = async (filter, params) => {
	const {
		rows: [post],
	} = await query(
		`
      select p.*, 
      json_build_object('username', author.username, 'profilePicture', author.profile_picture) as user,
      coalesce (array_agg(json_build_object('username', u.username, 'profilePicture', u.profile_picture)) 
      filter (where u.username is not null), '{}') as likes,
      coalesce (array_agg(
        json_build_object
        ('username', u2.username, 'profilePicture', u2.profile_picture,
        'content', c.content, 'img', c.img, 'createdAt', c.created_at, 'updatedAt', c.updated_at)
      ) filter (where u2.username is not null), '{}') as comments
      from posts p
      join users author on  p.author = author.id
      left join post_likes pl on p.id = pl.post_id
      left join users u on pl.user_id = u.id
      left join comments c on p.id = c.post_id
      left join users u2 on c.user_id = u2.id
			${filter}
      group by p.id, author.username, author.profile_picture;
		`,
		params
	);
	if (!post) throw new Error('post is not found');
	return post;
};

const getOnePost = async postId => {
	const post = await postQuery('where p.id = $1', [postId]);
	return post;
};

const getUserPosts = async userId => {
	const posts = await postQuery('where p.author = $1', [userId]);
	return posts;
};

const getTimeLine = async userId => {
	const posts = await postQuery(
		`
			where p.author = $1 or p.author in (
				select 
				case  
					when user1_id = p.author then user2_id 
					when user2_id = p.author then user1_id
				end
				from friendship where p.author in (user1_id, user2_id)
			)
	`,
		[userId]
	);
	return posts;
};

const deletePost = async (postId, authorId) => {
	try {
		const { rowCount } = await query(
			`delete from posts p where p.id = $1 and p.author = $2;`,
			[postId, authorId]
		);
		return !!rowCount;
	} catch (err) {
		throw err;
	}
};

const togglePostLike = async (userId, postId) => {
	try {
		const {
			rows: [post],
		} = await query(
			`insert into post_likes(user_id, post_id) values($1, $2) 
										on conflict(user_id, post_id)
										do  update set liked = not post_likes.liked 
										where post_likes.user_id = $1 and post_likes.post_id = $2
										returning liked;`,
			[userId, postId]
		);
		return post.liked;
	} catch (e) {
		throw new Error('Post is not found');
	}
};

//-------------------- comments-------------------------//
const addComment = async ({ postId, userId, content, img }) => {
	const client = await pool.connect();
	try {
		await client.query(`begin`);
		const {
			rows: [comment],
		} = await client.query(
			`insert into comments(post_id, user_id, content, img) values($1, $2, $3, $4) returning *`,
			[postId, userId, content, img ? img : '']
		);
		await client.query(
			`
				insert into posts_subscribers values ($1, $2) on conflict do nothing;
		`,
			[postId, userId]
		);
		await client.query(`commit`);
		return comment;
	} catch (err) {
		await client.query(`rollback`);
		throw new Error('Invalid input');
	} finally {
		await client.release();
	}
};

const updateComment = async (commentId, userId, updates) => {
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
		return comment;
	} catch (err) {
		throw new Error('Invalid input');
	}
};

const toggleCommentLike = async (userId, commentId) => {
	try {
		const {
			rows: [comment],
		} = await query(
			`insert into comment_likes(user_id, comment_id) values($1, $2) 
										on conflict(user_id, comment_id)
										do  update set liked = not comment_likes.liked 
										where comment_likes.user_id = $1 and comment_likes.post_id = $2
										returning liked;`,
			[userId, commentId]
		);
		return comment.liked;
	} catch (e) {
		throw new Error('Comment is not found');
	}
};

module.exports = {
	createPost,
	updatePost,
	postQuery,
	getOnePost,
	togglePostLike,
	getTimeLine,
	getUserPosts,
	deletePost,
	addComment,
	updateComment,
	toggleCommentLike,
};
