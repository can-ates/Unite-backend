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


router.get('/api/post/:id', (req, res) => {
    console.log('anan')
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


router.post('/api/:id/post/:postId/add-comment', auth, isMember, (req, res) => {
    console.log(req.body)
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