const { User } = require('./../models/user');
const jwt = require('jsonwebtoken')
require('dotenv').config()

let auth = (req,res,next) => {
    let token = req.cookies.u_auth;

    

    jwt.verify(token, process.env.SECRET,function(err, userId){
        
        if(err) return res.json({message: err.message})

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

    // User.findByToken(token,(err,user)=>{
    //     if(err) throw err;
    //     if(!user) return res.json({
    //         isAuth: false,
    //         error: true
    //     });

    //     req.token = token;
    //     req.user = user;
    //     next();
    // })

}


module.exports = { auth }