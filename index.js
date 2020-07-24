const mongoose = require('mongoose');
const express = require('express');
var cors = require('cors');
const cookieParser = require('cookie-parser'); 

const app = express()
var bodyParser = require('body-parser')

var cors = require('cors');
require('dotenv').config()



mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true,  autoIndex: false });
mongoose.set('useCreateIndex', true)
mongoose.Promise = global.Promise;

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
  res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.setHeader('set-cookie', [
    'same-site-cookie=http://cloudinary.com/; SameSite=Lax',
    'cross-site-cookie=http://cloudinary.com/; SameSite=None; Secure',
  ]);
  next()
})




app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cookieParser());
// app.use(cors({credentials: true}))





//Routes
const userRoutes    = require("./routes/users")
const communityRoutes    = require("./routes/communities")
const postRoutes    = require("./routes/posts")


app.get('/', (req, res) => {
    res.send('Hello World')
})


//Routes as a middleware
app.use(userRoutes);
app.use(communityRoutes);
app.use(postRoutes);



const PORT = process.env.PORT || 3002
app.listen(PORT);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log(PORT)
});

