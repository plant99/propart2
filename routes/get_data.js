var express = require('express') ;
var router = express.Router() ;
router.get('/', function(req, res, next){
	Invite.find({}, function(err, invites){
		User.findOne({username: req.decoded._doc.username}, function(err, user){
			res.json({invites:invites,  user: user})
			console.log(user) ;
		})
	})
})
router.get('/:category',function(req, res, next){
	Invite.find({category: req.params.category}, function(err, invites){
		if(invites.length){
			User.findOne({username: req.decoded._doc.username}, function(err, user){
				res.json({invites:invites,  user: user})
				console.log(user) ;
			})
		}else{
			res.json({success: false})
		}
	})
})

router.get('/user_applied_invites/:id', function(req, res, next){
	var applied_invites_to_be_sent = [] ;
	User.findOne({_id: req.params.id}, function(err, user){
		var applied_invites = user.applied_invitations ;
		var index = 0;
		for(var i=0 ;i< applied_invites.length ;i++){
			Invite.findOne({_id: applied_invites[i].id}, function(err, invite){
				applied_invites_to_be_sent.push(invite)
				index++;
				if(index === applied_invites.length){
					User.findOne({username: req.decoded._doc.username},function(err, user_to_be_sent){
						res.json({success: true, user: user_to_be_sent , applied_invites: applied_invites_to_be_sent})
					})
				}
			})
		}
	})
})
router.get('/user_created_invites/:id', function(req, res, next){
	User.findOne({_id: req.params.id}, function(err, user){
		if(err){
			res.json({error: err})
		}else{
			var active_invites = user.active_invitations ;
			var index=0 ;
			var created_invites_to_be_sent = [] ;
			for(var i=0 ;i<active_invites.length;i++){
				Invite.findOne({_id: active_invites[i]}, function(err, invite){
					index++ ;
					created_invites_to_be_sent.push(invite) ;
					if(index ===  active_invites.length){
						res.json({success:true, created_invites:created_invites_to_be_sent, user: req.decoded._doc})
					}
				})
			}
		}
	})
})
router.get('/suggest_usernames/:userName', function(req, res, next){
	var username = req.params.userName ;
	var suggested_usernames = [];
	var usernames = [], usernames_to_be_sent = [] ;
	User.find({},{username:1,_id:0}, function(err, data){
		console.log(username,'what bro')
		var string_length = username.length;
		if(err) console.log(err) ;
		if(data){
			for(user of data){
				usernames.push(user.username) ;
			}
			usernames = usernames.sort() ;
			for(username_tbc of usernames){
				if(username_tbc.slice(0,string_length) === username){
					usernames_to_be_sent.push(username_tbc) ;
				}else{
					console.log(username_tbc.slice(0,string_length)) ;
				}
			}
			console.log(usernames_to_be_sent)
			if(usernames_to_be_sent.length >=5){
				usernames_to_be_sent = usernames_to_be_sent.splice(0,5) ;
			}
			if(usernames_to_be_sent.length){
				res.json({success:true, usernames:usernames_to_be_sent}) ;
			}else{
				res.json({success:false})
			}
		}
	})


})
module.exports = router ;
