const router = require('express').Router();
const {
	startConversation,
	getOneConversation,
} = require('../db/conversationService');
const invitationHandler = require('../socketHandlers/invitationHandler');

// start a conversation.
router.post('/startConversation', async (req, res, next) => {
	const userIds = req.body.users;
	const creatorId = req.body.userId;
	try {
		const conversationId = await startConversation(userIds);
		invitationHandler(conversationId, creatorId);
		res.status(200).json({
			data: {
				conversationId,
			},
			errors: null,
		});
	} catch (err) {
		console.log(err);
		next(err);
	}
});

// get one conversation
router.get('/:id', async (req, res, next) => {
	const userId = req.body.userId;
	const conversationId = req.params.id;
	try {
		const conversation = await getOneConversation(userId, conversationId);
		res.status(200).json({
			data: {
				conversation,
			},
			errors: null,
		});
	} catch (err) {
		next(err);
	}
});

module.exports = router;
