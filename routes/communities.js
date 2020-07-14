const express = require('express');

const { User } = require('../models/user');
const { Community } = require('../models/community');
const { Post } = require('../models/post');

const { auth } = require('../middlewares/auth');
const { isMember } = require('../middlewares/isMember');

var router  = express.Router();

//ALL COMMUNITIES
router.get('/api/allCommunities', (req, res) => {
    Community.find().populate('founder').select('-posts -email').exec((err, community) => {
        
        err ? res.status(400).json({err}) : res.status(200).json({community})
    })
})

//ONE COMMUNITY
router.get('/api/community/:id', (req, res) => {
    Community.findById(req.params.id)
            .populate('members')
            .populate('posts').exec((err, community) => {

            err ? res.status(400).json({err}) : res.status(200).json({community})
    })
})

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

    Community.findById({'_id': req.params.id}, (err, community) => {
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