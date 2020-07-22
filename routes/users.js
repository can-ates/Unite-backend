const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { check, validationResult} = require('express-validator')

const { auth } = require('../middlewares/auth');
const { User } = require('../models/user');

var router  = express.Router();


router.get('/api/users/auth', auth, (req,res)=>{
    res.status(200).json({
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
    })
})

router.post('/api/users/register',
    [
        check('email').isEmail().withMessage('not a valid email'),
        check('password').isLength({min: 9}).withMessage('must be at least 9 chars long')
    ]
    ,
    (req, res) => {
    
    if(validationResult(req).isEmpty()) {
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
            
                    res.cookie('u_auth', token).status(200).json({
                        registerSuccess: true,
                        doc,
                        isAuth: true,
                        
                    })
                })
            })
        })   
    } else
        return res.json(validationResult(req))
    

     
    
})

router.post('/api/users/login', (req,res) => {
    User.findOne({'email':req.body.email},(err,user)=>{

        
        if(!user) return res.json({loginSuccess:false, message:'Email or Password is not correct'});


        bcrypt.compare(req.body.password, user.password,function(err,isMatch){
            if(err) return err;
            
            if(!isMatch) return res.json({loginSuccess:false, message:'Email or Password is not correct'});

            const token = jwt.sign(user._id.toHexString(), process.env.SECRET);
            
            res.cookie('u_auth', token, {maxAge: 900000, httpOnly: true})

            res.json({isAuth: true, user})

        })
    })
})



router.get('/api/users/logout', (req,res)=>{
    res.clearCookie('u_auth')
    res.json({message: 'Cookie cleared', isAuth: false})
})


module.exports = router;