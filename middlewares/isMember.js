const { Community } = require('./../models/community');

let isMember = (req,res,next) => {

    Community.findOne({'_id': req.params.id}, (err, community) => {
        if(!community) return res.json({memberFailed: true, message: 'Community could not be find'})

        Community.findOne({'members': req.user._id}, (err, user) => {
            if(err) return res.json({err})

            if(user){
                req.community = community
                next()
            }

            if(!user){
                if(JSON.stringify(req.user._id) === JSON.stringify(community.founder)){
                    next()
                } 
                else return res.json({notMember: true, message: 'You should be member, in order to add post'})  
            } 
    })

})}


module.exports = { isMember }