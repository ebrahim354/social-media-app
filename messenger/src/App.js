const express = require('express');
const App = express();
const NotificationRouter = require('./routes/Notifications');
const MassengerRouter = require('./routes/massenger');
const getToken = require('./middleware/getToken');
const { validateToken } = require('./middleware/validation');
const errorHandler = require('./middleware/errorHandler');
// routes

App.use('/socket/notifications', NotificationRouter);
App.use('/massenger', getToken, validateToken, MassengerRouter);

App.use(errorHandler);

module.exports = App;
