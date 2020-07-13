const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { User } = require('../models/user');

var router  = express.Router();


router.post('/api/users/register', (req, res) => {

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

router.post('/api/users/login',(req,res)=>{
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



router.get('/api/users/logout', (req,res)=>{
    res.clearCookie('u_auth')
    res.json({message: 'Cookie cleared'})
})


module.exports = router;