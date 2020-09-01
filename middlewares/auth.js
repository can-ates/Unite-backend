const { User } = require('../models/user');
const jwt = require('jsonwebtoken')
require('dotenv').config()

let auth = (req,res,next) => {
    let token = req.cookies.u_auth
    
    jwt.verify(token, process.env.SECRET,function(err, userId){
        
        if(err) return res.json({
            isAuth: false
        })

        User.findById(userId).
        populate('memberships').
        select('-password').
        exec((err, user) => {
            
            if(err) return err

            if(!user)  return res.json({
                isAuth: false,
                
            })
            
            req.user = user
            next();
            
        })
           
        })
    }



module.exports = { auth }