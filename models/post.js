const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = mongoose.Schema({
    title:{
        type:String,
        required: true,
        maxlength: 25
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
    comments: [
        {
          user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
          },
          text: {
            type: String,
            required: true
          },
          name: {
            type: String
          },
          date: {
            type: Date,
            default: Date.now
          }
        }
      ],
    createdAt: { type: Date, default: Date.now },
});




const Post = mongoose.model('Post', postSchema);

module.exports = { Post }