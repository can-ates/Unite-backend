const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const communitySchema = mongoose.Schema({
    title:{
        type:String,
        required: true,
        unique: 1,
        maxlength: 20
    },
    founder: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    image: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
        maxlength: 200
    },
    members: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    posts: [{
        type: Schema.Types.ObjectId,
        ref: 'Post'
    }]
    
}, {timestamps: true});

const Community = mongoose.model('Community', communitySchema);
module.exports = { Community }