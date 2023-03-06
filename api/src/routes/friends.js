const router = require('express').Router();
const { idValidation, userIdValidation } = require('../middleware/validation');
const {
	acceptFriendRequest,
	sendOrDeleteFriendRequest,
	unfriend,
} = require('../db/friendService');
const {
	publishAcceptFriendRequest,
	publishSendFriendRequest,
} = require('../db/notificationService');

// accept a friend request
router.put('/acceptFriendRequest/:id', async (req, res, next) => {
	const userId = req.body.userId;
	const id = req.params.id;
	if (userId === id)
		return res
			.status(403)
			.send("you can't accept friend requests from yourself");
	try {
		await acceptFriendRequest(userId, id);
		await publishAcceptFriendRequest(userId, id);
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
			const sent = await sendOrDeleteFriendRequest(userId, id);
			if (sent) await publishSendFriendRequest(id, userId);
			const txt = sent
				? 'friend request has been sent'
				: 'friend request is removed';
			res.status(200).send(txt);
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
			await unfriend(userId, id);
			res.status(200).send('unfriended successfully');
		} catch (err) {
			next(err);
		}
	}
);

module.exports = router;
