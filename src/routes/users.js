const router = require('express').Router();
const bcrypt = require('bcrypt');
const {
	getFullUser,
	updateUser,
	deleteUser,
	getSimpleUser,
} = require('../db/userService');
const {
	updatesValidation,
	userIdValidation,
} = require('../middleware/validation');

//get the user on the token (data for login)
router.get('/', async (req, res, next) => {
	const id = req.body.userId;
	// console.log(id)
	try {
		const user = await getFullUser({ id });
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
		delete updates.id;
		delete updates.created_at;
		delete updates.last_visit;
		const user = await updateUser(id, updates);
		res.status(200).json(user);
	} catch (err) {
		console.log('update error: ', err);
		res.status(400).send('bad request');
	}
});
//delete user
router.delete('/', userIdValidation, async (req, res, next) => {
	const id = req.body.userId;
	try {
		await deleteUser(id);
		res.status(200).send('user deleted successfully');
	} catch (err) {
		next(err);
	}
});

//get a user
router.get('/:id', async (req, res, next) => {
	const id = req.params.id;
	try {
		const user = await getSimpleUser(id);
		if (!user) return res.status(404).send('user not found');
		res.status(200).json(user);
	} catch (err) {
		next(err);
	}
});

module.exports = router;
