const { User } = require('./../models/user');
const jwt = require('jsonwebtoken')
require('dotenv').config()

let auth = (req,res,next) => {
    let token = req.cookies.u_auth


    console.log('auth', token)
    jwt.verify(token, process.env.SECRET,function(err, userId){
        
        if(err) return res.json({
            message: "Please login",
            isAuth: false
        })

        User.findOne({"_id": userId} ,function(err,user){
            if(err) return err

            if(!user) return res.json({
                isAuth: false,
                error: true
            })

            req.user = user
            next();
        }).select('-password')
    })
}


module.exports = { auth }