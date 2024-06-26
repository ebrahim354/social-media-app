const router = require('express').Router();
const { BUCKET } = require('../utils/config');
const bcrypt = require('bcrypt');
const multer = require('multer');
const {
	getFullUser,
	updateUser,
	deleteUser,
	getSimpleUser,
	getUsersWithUsername,
} = require('../db/userService');
const { getUsersUnseenNotification } = require('../db/notificationService.js');

const { getUserPosts } = require('../db/postService');
const {
	updatesValidation,
	userIdValidation,
	validateImg
} = require('../middleware/validation');

const path = require('path');

const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const s3 = new S3Client();
const MulterS3 = require('multer-s3');

const multerS3 = BUCKET ? MulterS3({
    s3: s3,
    bucket: BUCKET ,
    key: function (req, file, cb) {
      console.log('filename', file.originalname);
      const imgPath = Date.now() + file.originalname;
      req.body.img = imgPath;
      cb(null, imgPath);
    }
  }) : null;

const upload = multer({
  storage: BUCKET ? multerS3 : null,
  dest: BUCKET ? null : path.join(__dirname, "../../public/post"),
});

//get the user on the token (data for login)
router.get('/', async (req, res, next) => {
	const id = req.body.userId;
	// console.log(id)
	try {
		const user = await getFullUser({ id });
		if (!user) {
			return res.status(404).send('user not found');
		}
		delete user.password;
		res.status(200).json(user);
	} catch (err) {
		next(err);
	}
});

router.get('/notifications', async (req, res, next) => {
	const userId = req.body.userId;
	try {
		const notifications = await getUsersUnseenNotification(userId);
		res.status(200).json(notifications);
	} catch (err) {
		next(err);
	}
});

// upload user profile picture.
router.post(
	'/upload-profile-picture',
	userIdValidation,
	upload.single('file'),
	validateImg,
	async (req, res, next) => {
		const profile_picture = req.body.img;
		const userId = req.userId;
//		const notification = `has uploaded a new profile picture!`;
		try {
			const user = await updateUser(userId, {profile_picture});
			// handle that later.
			// await publishPostNotification(post.id, userId, notification);
			res.status(200).json({
				data: {
					profile_picture: user.profile_picture
				},
				errors: null,
			});
		} catch (err) {
			next(err);
		}
	}
);

// upload user cover picture.
router.post(
	'/upload-cover-picture',
	userIdValidation,
	upload.single('file'),
	validateImg,
	async (req, res, next) => {
		const cover_picture = req.body.img;
		const userId = req.userId;
//		const notification = `has uploaded a new cover picture!`;
		try {
			const user = await updateUser(userId, {cover_picture});
			// handle that later.
			// await publishPostNotification(post.id, userId, notification);
			res.status(200).json({
				data: {
					cover_picture: user.cover_picture
				},
				errors: null,
			});
		} catch (err) {
			next(err);
		}
	}
);




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
	const userId = req.body.userId;
	try {
		const user = await getSimpleUser(id, userId);
		if (!user) return res.status(404).send('user not found');
		res.status(200).json(user);
	} catch (err) {
		next(err);
	}
});

//get users with search query
router.get('/search/:username', async (req, res, next) => {
	const username = req.params.username;
	try {
		const users = await getUsersWithUsername(username);
		if (!users) return res.status(404).send('user not found');
		res.status(200).json(users);
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

module.exports = router;
