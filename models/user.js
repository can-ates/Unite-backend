const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    email:{
        type:String,
        required: true,
        trim: true,
        unique: 1,
        lowercase: true
    },
    password:{
        type:String,
        required: true,
    },
    name:{
        type:String,
        required: true,
        maxlength:100
    },
    lastname:{
        type:String,
        required: true,
        maxlength:100
    },
    
});

userSchema.methods.toJSON = function () { 
    const user = this                     
    
    const userObject = user.toObject() //return raw object data

    delete userObject.password
    
    

    return userObject
}



const User = mongoose.model('User',userSchema);

module.exports = { User }