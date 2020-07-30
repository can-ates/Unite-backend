const mongoose = require('mongoose');
const express = require('express');
const cookieParser = require('cookie-parser'); 

const app = express()
var bodyParser = require('body-parser')

require('dotenv').config()



mongoose.connect(process.env.MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true,  autoIndex: false });
mongoose.set('useCreateIndex', true)
mongoose.Promise = global.Promise;

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
  res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.setHeader('set-cookie', [
    'same-site-cookie=http://cloudinary.com/; SameSite=None; Secure',
    'cross-site-cookie=http://cloudinary.com/; SameSite=None; Secure',
  ]);
  next()
})




app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cookieParser());
// app.use(cors({credentials: true}))


app.use(express.static('client/build'))


//Routes
const userRoutes    = require('../server/routes/users')
const communityRoutes    = require("../server/routes/communities")
const postRoutes    = require("../server/routes/posts")


app.get('/', (req, res) => {
    res.send('Hello World')
})

//XD
//Routes as a middleware
app.use(userRoutes);
app.use(communityRoutes);
app.use(postRoutes);

//DEFAULT
if(process.env.NODE_ENV === 'production'){
  const path = require('path');

  app.get('/*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client', 'build', 'index.html'))
  })
}

const PORT = process.env.PORT || 3002
app.listen(PORT);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log(PORT)
});

