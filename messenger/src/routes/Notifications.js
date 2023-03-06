const router = require('express').Router();
const notificationsHandler = require('../socketHandlers/notificationsHandler');

/*
  body{
    users: string[],
    content: string,
    img: string,
  }
*/
router.post('/', (req, res) => {
	try {
		const users = req.body.users;
		const content = req.body.content;
		const img = req.body.img;
		const name = req.body.name;
		notificationsHandler(users, { content, img, name });
		res.send(200).json({
			data: true,
			errors: null,
		});
	} catch (err) {
		console.log(err);
	}
});

module.exports = router;
