const express = require('express');
const App = express();

//packages
// s3 related package for uploading images using amazom s3.
const { S3Client, GetObjectCommand, HeadObjectCommand, GetObjectTaggingCommand } = require('@aws-sdk/client-s3');
const s3 = new S3Client();
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
// routes
const users = require('./routes/users');
const posts = require('./routes/posts');
const auth = require('./routes/auth');
const friends = require('./routes/friends');
const verification = require('./routes/verifyTokenRoute');
const conversations = require('./routes/conversations');
// utils
const getToken = require('./middleware/getToken');
const { validateToken } = require('./middleware/validation');
const errorHandler = require('./middleware/errorHandler');
const { BUCKET } = require("./utils/config");

App.use(express.static(path.join(__dirname, '..')));
App.use(express.json());
App.use(morgan('tiny'));
App.use(helmet());
App.use(cors());

App.get('/', (_, res) => {
	return res.send('hello');
});

App.use(getToken);
App.use('/api/verifyToken', verification);
App.use('/api/auth/', auth);
App.use('/api/users', validateToken, users);
App.use('/api/conversations', validateToken, conversations);
App.use('/api/posts', validateToken, posts);
App.use('/api/friends', validateToken, friends);

// CDN.
App.get("*", async (req, res) => {
  let filename = req.path.slice(1);
  const params = {
    Bucket: BUCKET,
    Key: filename
  }
  try {
     const headResponse = await s3.send(new HeadObjectCommand(params));
     console.log('res- ', headResponse);
        res.set({
            "Content-Length": headResponse.ContentLength,
            "Content-Type": headResponse.ContentType,
            "ETag": headResponse.ETag,
        });
   const response = await s3.send(new GetObjectCommand(params));
        const stream = response.Body;
        stream.on("data", (chunk) => res.write(chunk));
        stream.once("end", () => {
            res.end();
        });
        stream.once("error", () => {
            res.end();
        });
  } catch (error) {
    if (error.code === "NoSuchKey") {
      console.log(`No such key ${filename}`);
      res.sendStatus(404).end();
    } else {
      console.log(error);
      res.sendStatus(500).end();
    }
  }
});

App.use(errorHandler);

module.exports = App;
