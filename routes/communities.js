const express = require('express');

const { User } = require('../models/user');
const { Community } = require('../models/community');
const { Comment } = require('../models/comment');
const { Post } = require('../models/post');

const { auth } = require('../middlewares/auth');
const { isMember } = require('../middlewares/isMember');

var router  = express.Router();


router.post('/api/community/add-community', auth, (req, res) => {

    Community.findOne({'title': req.body.title}, (err, community) => {
        if(community) return res.json({createFailed: true, message: 'Community already exists'})

        const com = new Community({
            founder: req.user._id,
            title: req.body.title,
        })


        com.save((err, doc) => {
            err ? res.json({err}) : res.status(200).json({doc})

            
        })

    })
})

router.post('/api/community/:id/beMember', auth, (req, res) => {

    Community.findOne({'_id': req.params.id}, (err, community) => {
        if(!community) return res.json({memberFailed: true, message: 'Community could not be find'})

        Community.findOne({'members': req.user._id}, (err, user) => {
            
            if(JSON.stringify(req.user._id) === JSON.stringify(community.founder)) return res.json({memberFailed: true, message: "You are the founder, geez"})

            if(user) return res.json({memberFailed: true, message: 'You are already member of the community'})

            community.members.push(req.user._id)

            community.save((err, doc) => {

                err ? res.json({err}) : res.status(200).json({doc})

            })
        })
    })
})

router.post('/api/community/:id/create-post', auth, isMember, (req, res) => {
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


router.post('/api/community/:id/:postId', auth, isMember, (req, res) => {
    const comment = new Comment({
        text: req.body.text,
        author: req.user._id
    })

    comment.save((err, cmnt) => {
        Post.findOne({'_id': req.params.postId}, (err, post) =>{

            err ? res.json({err}) : post.comments.push(comment)

            post.save((err, doc) => {

                err ? res.json({err}) : res.status(200).json({doc})

            })

        })
    })
})

module.exports = router;