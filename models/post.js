const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = mongoose.Schema({
    title:{
        type:String,
        required: true,
    },
    description:{
        type:String,
        required: true,
    },
    author:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    comments :[{
        type:Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    
});




const Post = mongoose.model('Post', postSchema);

module.exports = { Post }