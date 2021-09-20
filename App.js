//config
const { DB } = require('./utils/config')

const express = require('express')
const App = express()
//packages
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const path = require('path')
const mongoose = require('mongoose')
// routes
const users = require('./routes/users')
const posts = require('./routes/posts')
const auth = require('./routes/auth')
// utils
const getToken = require('./middleware/getToken')
const { validateToken } = require('./middleware/validation')
const errorHandler = require('./middleware/errorHandler')

mongoose.connect(
	DB,
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

module.exports = App
