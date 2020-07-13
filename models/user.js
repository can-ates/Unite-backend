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




const User = mongoose.model('User',userSchema);

module.exports = { User }