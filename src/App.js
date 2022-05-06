const express = require('express');
const App = express();
//packages
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
// routes
const users = require('./routes/users');
const posts = require('./routes/posts');
const auth = require('./routes/auth');
const friends = require('./routes/friends');
// utils
const getToken = require('./middleware/getToken');
const { validateToken } = require('./middleware/validation');
const errorHandler = require('./middleware/errorHandler');

App.use(express.static(path.join(__dirname, '.')));
App.use(express.json());
App.use(morgan('tiny'));
App.use(helmet());
App.use(cors());

App.use(getToken);
App.use('/api/auth', auth);
App.use('/api/users', validateToken, users);
App.use('/api/posts', validateToken, posts);
App.use('/api/friends', validateToken, friends);

App.use(errorHandler);

module.exports = App;
