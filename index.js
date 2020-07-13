const mongoose = require('mongoose');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser'); 

const app = express()
var bodyParser = require('body-parser')
require('dotenv').config()


mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set('useCreateIndex', true)
mongoose.Promise = global.Promise;

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cookieParser());

//Models
const { User } = require('./models/user');
const { Community } = require('./models/community');
const { Post } = require('./models/post');
const { Comment } = require('./models/comment');

//Middlewares
const { auth } = require('./middlewares/auth');


app.get('/', (req, res) => {
    res.send('Hello World')
})


//------COMMUNITY--------//
app.post('/api/community/add-community', auth, (req, res) => {

    Community.findOne({'title': req.body.title}, (err, community) => {
        if(community) return res.json({createFailed: true, message: 'Community already exists'})

        const com = new Community({
            founder: req.user._id,
            title: req.body.title,
        })

        com.save((err, doc) => {
            if(err) return err

            res.status(200).json({doc})
        })

    })
})

app.post('/api/community/:id/beMember', auth, (req, res) => {

    Community.findOne({'_id': req.params.id}, (err, community) => {
        if(!community) return res.json({memberFailed: true, message: 'Community could not be find'})

        Community.findOne({'members': req.user._id}, (err, user) => {
            
            if(JSON.stringify(req.user._id) === JSON.stringify(community.founder)) return res.json({memberFailed: true, message: "You are the founder, geez"})

            if(user) return res.json({memberFailed: true, message: 'You are already member of the community'})

            community.members.push(req.user._id)

            community.save((err, doc) => {
                if(err) return err
    
                res.status(200).json({doc})
            })
        })
    })
})




//------COMMUNITY--------//

//------USERS-----------//
app.post('/api/users/register', (req, res) => {

    const user = new User(req.body);

    bcrypt.genSalt(10, function(err,salt){ //generated salt for hash process
        if(err) return err;

        //HASHED PASSWORD
        bcrypt.hash(user.password ,salt, function(err,hash){
            if(err) return err;
            user.password = hash;
            
            user.save((err,doc)=> {     //doc is the body that we provided
                if(err) return res.json({success:false, err});
                
                const token = jwt.sign(user._id.toHexString(), process.env.SECRET);
        
                res.cookie('u_auth', token, {httpOnly: true}).status(200).json({
                    registerSucess: true
                })
            })
        })
    })    
    
})

app.post('/api/users/login',(req,res)=>{
    User.findOne({'email':req.body.email},(err,user)=>{

        if(!user) return res.json({loginSuccess:false, message:'Email or Password is not correct'});


        bcrypt.compare(req.body.password, user.password,function(err,isMatch){
            if(err) return err;
            
            if(!isMatch) return res.json({loginSuccess:false, message:'Email or Password is not correct'});

            const token = jwt.sign(user._id.toHexString(), process.env.SECRET);

            res.cookie('u_auth', token, {httpOnly: true}).status(200).json({
                loginSucess: true
            })

        })
    })
})



app.get('/api/users/logout', (req,res)=>{
    res.clearCookie('u_auth')
    res.json({message: 'Cookie cleared'})
})
//------USERS-----------//



const PORT = process.env.PORT || 3000
app.listen(PORT);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('connected')
});

