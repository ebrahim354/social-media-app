const router = require('express').Router();
const bcrypt = require('bcrypt');
const { objectToParams } = require('../utils/dynamicSql');
const { query } = require('../db');
const {
	idValidation,
	updatesValidation,
	userIdValidation,
} = require('../middleware/validation');
const { areFriends, requestSent } = require('../utils/userUtils');

//get all users for testing
// router.get('/all', async (req, res, next) => {
// 	try {
// 		const users = await User.find({})
// 		res.status(200).json(users)
// 	} catch (err) {
// 		next(err)
// 	}
// })

//get the user on the token (data for login)
router.get('/', async (req, res, next) => {
	const id = req.body.userId;
	// console.log(id)
	try {
		const {
			rows: [user],
		} = await query(
			`	select u1.*, 
				coalesce (ARRAY_AGG(json_build_object('username', u2.username, 'profilePicture', u2.profile_picture))  
				filter (where u2.username is not null), '{}') friends, 
				coalesce (ARRAY_AGG(json_build_object('username', u3.username, 'profilePicture', u3.profile_picture))  
				filter (where u3.username is not null), '{}') friendRequests 
				from users u1
				left join friendship f on u1.id in (f.user1_id, f.user2_id) 
				left join users u2 on (u2.id in (f.user1_id, f.user2_id) and u2.id != u1.id)
				left join friend_request f2 on u1.id = f2.receiver 
				left join users u3 on f2.sender = u3.id
				where u1.id = $1
				group by u1.id;
			`,
			[id]
		);
		console.log('found user: ', user);
		if (!user) {
			return res.status(404).send('user not found');
		}
		res.status(200).json(user);
	} catch (err) {
		next(err);
	}
});

//update user
router.put('/', updatesValidation, userIdValidation, async (req, res, next) => {
	const id = req.body.userId;
	const updates = req.body.updates;
	try {
		//check for updating the password requests
		if (updates.password) {
			const salt = await bcrypt.genSalt(10);
			updates.password = await bcrypt.hash(updates.password, salt);
		}
		if (updates.id) {
			delete updates.id;
		}
		updates.updated_at = new Date();
		const [result, vals, counter] = objectToParams(updates);
		const {
			rows: [user],
		} = await query(
			`update users set ${result} where id = $${counter} returning *;`,
			[...vals, id]
		);
		res.status(200).json(user);
	} catch (err) {
		res.status(400).send('bad request');
	}
});
//delete user
router.delete('/', userIdValidation, async (req, res, next) => {
	const id = req.body.userId;
	try {
		// fix this later delete friedship and friendrequest to that user
		await query(`delete from users where id = $1`, [id]);
		// const user = await User.findByIdAndRemove(id)
		res.status(200).send('user deleted successfully');
	} catch (err) {
		next(err);
	}
});
//get a user
// should add the private and friends only functionality later after adding an orm or making
// some database abstractions now just get it up
router.get('/:id', async (req, res, next) => {
	const id = req.params.id;
	console.log('id: ', id);
	try {
		const {
			rows: [user],
		} = await query('select * from users where id = $1;', [id]);
		// const user = await User.findById(id)
		delete user.password;
		delete user.updated_at;
		console.log(user);
		if (!user) {
			return res.status(404).send('user not found');
		}
		// const { password, updatedAt, ...other } = user._doc
		// you don't need that information
		res.status(200).json(user);
	} catch (err) {
		next(err);
	}
});

// accept a friend request
router.put('/acceptFriendRequest/:id', async (req, res, next) => {
	const userId = req.body.userId;
	const id = req.params.id;
	if (userId === id)
		return res
			.status(403)
			.send("you can't accept friend requests form yourself");

	try {
		const { rows } = await query(` select * from users where id in ($1, $2)`, [
			userId,
			id,
		]);
		const [sender, receiver] =
			rows[0].id === userId ? [rows[0], rows[1]] : [rows[1], rows[0]];

		if (!(sender && receiver) || rows.length != 2) {
			console.log('invalid ids');
			return res.status(400).send('invalid ids');
		}
		const sent = await requestSent(userId, id);
		if (!sent)
			return res
				.status(403)
				.send("you can't accept friend request from this user");

		await query(
			'delete from friend_request where sender in ($1, $2) and receiver in($1, $2)',
			[userId, id]
		);
		await query('insert into friendship(user1_id, user2_id) values($1, $2)', [
			userId,
			id,
		]);
		// await user.updateOne({
		// 	friendRequests: user.friendRequests.filter(i => i !== id),
		// 	friends: user.friends.concat(id),
		// })

		// await requester.updateOne({
		// 	friends: requester.friends.concat(userId),
		// })
		res.status(200).send('friend request accepted');
	} catch (err) {
		next(err);
	}
});

// send / delete friend request to a user
router.put(
	'/friendRequest/:id',
	idValidation,
	userIdValidation,
	async (req, res, next) => {
		const id = req.params.id;
		const userId = req.body.userId;

		if (id === userId)
			return res
				.status(403)
				.send("you can't send friend request to yourself :(");

		try {
			const { rows } = await query(
				` select * from users where id in ($1, $2)`,
				[userId, id]
			);
			const [sender, receiver] =
				rows[0].id === userId ? [rows[0], rows[1]] : [rows[1], rows[0]];

			if (!(sender && receiver) || rows.length != 2) {
				console.log('invalid ids');
				return res.status(400).send('invalid ids');
			}
			const friends = await areFriends(userId, id);
			const sent = await requestSent(userId, id);
			if (friends) {
				console.log('already friends');
				return res.status(403).send('you are already friends');
			}
			if (!sent) {
				await query(
					'insert into friend_request(sender, receiver) values($1, $2)',
					[userId, id]
				);
				// await receiver.updateOne({
				// 	friendRequests: receiver.friendRequests.concat(userId),
				// })
				res.status(200).send('friend request has been sent');
			} else {
				await query(
					'delete from friend_request where (sender = $1 and receiver = $2) or (sender = $2 and receiver = $1)',
					[userId, id]
				);
				// await receiver.updateOne({
				// 	friendRequests: receiver.friendRequests.filter(i => i !== userId),
				// })
				res.status(200).send('friend request is removed');
			}
		} catch (err) {
			next(err);
		}
	}
);

//unfriend a user
router.put(
	'/unfriend/:id',
	idValidation,
	userIdValidation,
	async (req, res, next) => {
		const id = req.params.id;
		const userId = req.body.userId;

		if (id === userId)
			return res.status(403).send("you can't unfriend yourself :(");

		try {
			const { rows } = await query(
				` select * from users where id in ($1, $2)`,
				[userId, id]
			);
			const [sender, receiver] =
				rows[0].id === userId ? [rows[0], rows[1]] : [rows[1], rows[0]];

			if (!(sender && receiver) || rows.length != 2) {
				console.log('invalid ids');
				return res.status(400).send('invalid ids');
			}
			const friends = await areFriends(userId, id);
			// const sender = await User.findById(userId)
			// const receiver = await User.findById(id)

			if (!friends) {
				return res.status(403).send("you can't unfriend this user");
			}

			await query(
				'delete from friendship where user1_id in ($1, $2) and user2_id in ($1, $2)',
				[userId, id]
			);
			// await receiver.updateOne({
			// 	friends: receiver.friends.filter(f => f !== userId),
			// })
			// await sender.updateOne({
			// 	friends: sender.friends.filter(f => f !== id),
			// })
			res.status(200).send('unfriended successfully');
		} catch (err) {
			next(err);
		}
	}
);

module.exports = router;
