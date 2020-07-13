const mongoose = require('mongoose');
const express = require('express');
const cookieParser = require('cookie-parser'); 

const app = express()
var bodyParser = require('body-parser')
require('dotenv').config()


mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true,  autoIndex: false });
mongoose.set('useCreateIndex', true)
mongoose.Promise = global.Promise;

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cookieParser());


//Routes
const userRoutes    = require("./routes/users")
const communityRoutes    = require("./routes/communities")


app.get('/', (req, res) => {
    res.send('Hello World')
})


//Routes as a middleware
app.use(userRoutes);
app.use(communityRoutes);


const PORT = process.env.PORT || 3000
app.listen(PORT);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('connected')
});

