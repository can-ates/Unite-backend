const express = require('express');
const cloudinary = require('cloudinary')
const formidable = require('express-formidable')
const { check, validationResult} = require('express-validator')
require('dotenv').config();

const { User } = require('../models/user');
const { Community } = require('../models/community');
const { Post } = require('../models/post');

const { auth } = require('../middlewares/auth');
const { isMember } = require('../middlewares/isMember');

var router  = express.Router();



//CREATE POST
router.post('/api/post/:id/create-post', auth, isMember, (req, res) => {
    const {title, description} = req.body;
    const post = new Post({
        title,
        description,
        author: req.user._id,
    })

    post.save((err,doc) => {
        req.community.posts.push(post)

        req.community.save((err, doc) => {

            err ? res.json({err}) : res.status(200).json({doc})

        })
    })
})

//READ PARTICULAR POST
router.get('/api/post/:id', (req, res) => {
    Post.findById(req.params.id)
            .populate('author')
            .populate({
                path: 'comments',
                populate: {
                    path: 'user'
                }
            }).exec((err, post) => {

            err ? res.status(400).json({err}) : res.status(200).json({post})
    })
})


//UPDATE POST
router.put('/api/post/:id', (req, res) => {
    const {title, description} = req.body.dataToSubmit

    Post.findByIdAndUpdate(
        {_id: req.params.id},
        {description,
        title
        }, (err, doc) => {
            if(err) return res.json({success: false, err})
            res.status(200).json(doc)
        })
})

//CREATE COMMENT ON POST
router.post('/api/:id/post/:postId/add-comment', auth, isMember, (req, res) => {
    const comment = {
        user : req.user._id,
        name : req.user.name,
        text : req.body.text
    }

        Post.findById({'_id': req.params.postId}, (err, post) =>{

            err ? res.json({err}) : post.comments.push(comment)

            post.save((err, newPost) => {

                err ? res.json({err}) : res.status(200).json({newPost})

            })

        })
    
})


module.exports = router;