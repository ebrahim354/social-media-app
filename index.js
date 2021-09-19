// config and env
const dotenv = require('dotenv')
dotenv.config()
const port = process.env.PORT
const db = process.env.DB_URL
// middle wares
const express = require('express')
const App = express()

const mongoose = require('mongoose')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const errorHandler = require('./middleware/errorHandler')
const path = require('path')
// routes
const users = require('./routes/users')
const posts = require('./routes/posts')
const auth = require('./routes/auth')

const getToken = require('./middleware/getToken')
const { validateToken } = require('./middleware/validation')

mongoose.connect(
	db,
	{
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true,
		useFindAndModify: false,
	},
	() => {
		console.log('connected to mongoDB')
	}
)

// testing space
// const getToken = require('./middleware/getToken')

// App.get('/testing', getToken, (req, res) => {
// 	if (req.token) res.send(req.token)
// })
// const Post = require('./models/Post')
// App.get('/reset', async (req, res) => {
// 	const posts = await Post.find({})
// 	for (let post of posts) {
// 		post.author = post.userId
// 		await post.save()
// 	}
// 	res.end()
// })
/*
const multer = require('multer')
const upload = multer({
	dest: 'public/post',
	storage,
})

// testing rout
App.post('/testing', upload.single('file'), (req, res) => {
	console.log('file: ', req.file)
	console.log('body: ', req.body)
})
*/
// testing space
App.use(express.static(path.join(__dirname, '.')))
App.use(express.json())
App.use(morgan('tiny'))
App.use(helmet())
App.use(cors())

App.use(getToken)
App.use('/api/auth', auth)
App.use('/api/users', validateToken, users)
App.use('/api/posts', validateToken, posts)

App.use(errorHandler)

App.listen(port, () => {
	console.log(`listening on port ${port}`)
})
