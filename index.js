const mongoose = require('mongoose');
const express = require('express');
const cookieParser = require('cookie-parser');
const https = require('https');
const fs = require('fs');
const path = require('path');

const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');

require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: false,
});
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);
mongoose.Promise = global.Promise;

// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', 'https://localhost:3000');
//   res.setHeader('Access-Control-Allow-Credentials', true);
//   res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
//   res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
//   res.setHeader('set-cookie', [
//     'same-site-cookie=https://cloudinary.com/; SameSite=None; Secure',
//     'cross-site-cookie=https://cloudinary.com/; SameSite=None; Secure',
//   ]);
//   next()
// })

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
// app.use(cors({credentials: true}))

//Routes
const userRoutes = require('../server/routes/users');
const communityRoutes = require('../server/routes/communities');
const postRoutes = require('../server/routes/posts');

//Routes as a middleware
app.use(userRoutes);
app.use(communityRoutes);
app.use(postRoutes);

//DEFAULT
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client', 'build', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
}

const PORT = process.env.PORT || 3002;

// https.createServer({
//   key: fs.readFileSync('server.key'),
//   cert: fs.readFileSync('server.cert')
// }, app)
// .listen(PORT, function () {
//   console.log('Example app listening on port 3000! Go to https://localhost:3000/')
// })

app.listen(PORT);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log(PORT);
});
