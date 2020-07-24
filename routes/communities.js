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

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
})

//ALL COMMUNITIES
router.get('/api/allCommunities', (req, res) => {

    let order = req.query.order ? req.query.order : 'asc';
    let sortBy = req.query.sortBy ? req.query.sortBy : "_id";
    let limit = req.query.limit ? parseInt(req.query.limit) : 20
    let skip = req.query.skip ? parseInt(req.query.skip) : 0
    
    Community.
    find().
    populate('founder', '-password').
    populate('members').
    sort([[sortBy, order]]).
    limit(limit).
    skip(skip).
    select('-posts').
    exec((err, community) => {
        
        err ? res.status(400).json({err}) : res.status(200).json({community})
    })
})

//ALL COMMUNITIES
router.get('/api/searchCommunities', (req, res) => {

    let order = req.query.order ? req.query.order : 'asc';
    let sortBy = req.query.sortBy
    let limit = req.query.limit ? parseInt(req.query.limit) : 20
    
    Community.find(
        { "title" : {"$regex": sortBy, "$options": "i"} }).
    populate('members').
    sort([[order]]).
    limit(limit).
    select('-posts').
    exec((err, community) => {
        err ? res.status(400).json({err}) : res.status(200).json({community})
    })


})
//ONE COMMUNITY
router.get('/api/community/:id', (req, res) => {
    Community.findById(req.params.id)
            .populate('members')
            .populate({
                path: 'posts',
                populate: {
                    path: 'author'
                }
            }).exec((err, community) => {

            err ? res.status(400).json({err}) : res.status(200).json({community})
    })
})



router.post('/api/community/uploadimage', formidable(), (req, res) => {
    cloudinary.uploader.upload(req.files.file.path, (result) => {
        
        res.status(200).send({
            public_id: result.public_id,
            url: result.url
        })
    }, {
        public_id: `${Date.now()}`,
        resource_type: 'auto'
    })
})

router.post('/api/community/add-community', auth, 
    [
        check('title').isLength({max: 20}).withMessage('Should not be longer than 20 chars'),
        check('description').isLength({max: 200}).withMessage('Should not be longer than 200 chars')
    ], (req, res) => {

    if(validationResult(req).isEmpty()){
        Community.findOne({'title': req.body.title}, (err, community) => {
            if(community) return res.json({createFailed: true, message: 'Community already exists'})
    
            const com = new Community({
                founder: req.user._id,
                title: req.body.title,
                description: req.body.description,
                image: req.body.image
            })
    
    
            com.save((err, doc) => {
                err ? res.json({err}) : res.status(200).json({doc})
      
            })
    
        })
    } else return res.json(validationResult(req))

})

router.post('/api/community/:id/beMember', auth, (req, res) => {

    Community.findById({'_id': req.params.id}, (err, community) => {
        if(!community) return res.json({memberFailed: true, message: 'Community could not be find'})

        Community.where({'_id': req.params.id}).findOne({'members': req.user._id}, (err, user) => {
            
            
            if(JSON.stringify(req.user._id) === JSON.stringify(community.founder)) return res.json({memberFailed: true, message: "You are the founder, geez"})

            if(user) return res.json({memberFailed: true, message: 'You are already member of the community'})

            community.members.push(req.user._id)

            community.save((err, doc) => {

                err ? res.json({err}) : res.status(200).json({doc})

            })
        })
    })
})




module.exports = router;