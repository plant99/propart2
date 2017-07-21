var express = require('express') ;
var router = express.Router() ;
router.post('/invite', function(req, res, next){
	var body = req.body ;
	var invite = new Invite({
		category: body.category,
		title: body.title,
		description: body.description,
		requirements: body.requirements.toString(),
		author: {
			name:req.decoded._doc.username,
			image: req.decoded._doc.image
		},
		applicants: []
	})
	invite.save(function(err, inviteSaved){
		if(err){
			res.json({success: false, message: 'Couldn\'t be saved'})
		}else{
			User.findOne({username: req.decoded._doc.username}, function(err, user){
				user.active_invitations.push(inviteSaved._id)
				user.save(function(err, userSaved){
					if(err){
						res.json({success: false, message: 'Couldn\'t be saved'}) ;
					}else{
						res.json({success:true, invite: invite})
					}
				})
			})
		}
	})
})

router.post('/request_for_invite',function(req, res, next){
	var id = req.body.id ;
	var user = req.decoded._doc ;
	if(id){
		Invite.findOne({_id: id}, function(err, inviteFound){
			if(inviteFound.author.name === user.username){
				res.json({success:false, message: 'You only created the invite.'})
			}else{
				Invite.findOne({_id: id}, function(err, inviteFound){
				if(err){
					res.json({success: false, message: 'Invite not found'})
				}else{
					if(findIndexOf({username: user.username, id: user._id}, inviteFound.applicants) === -1){
						inviteFound.applicants.push({username:user.username, id:user._id, status:{color: 'yellow', message:'Please wait for the user to evaluate your application.'}}) ;
						User.findOne({username: user.username},function(err, user){
							user.applied_invitations.push({id: id, status:{color: 'yellow', message:'Please wait for the user to evaluate your application.'}}) ;
							user.save(function(err, savedUser){							if(!err){
									inviteFound.save(function(err, savedInvite){
										res.json({success: true, invite: savedInvite})
									})
								}else{

									res.json({success:false})
								}
							})
						})
					}else{
						res.json({success:false, message:'Already Applied'}) ;
					}
				}
				})

			}
		})
	}else{
		res.json({success:false})
	}
})

router.post('/accept_invite',function(req, res, next){
	console.log('accept_invite ka to req aaya hai') ;
	var username = req.body.userId ;
	var inviteId = req.body.inviteId ;
	User.findOne({username: username}, function(err, user){
		var x = getIndexOfId(inviteId, user.applied_invitations) ;
		console.log(x, 'indexOfId')
		user.applied_invitations[x].status.color = 'green' ;
		user.applied_invitations[x].status.message = 'Your application to this invite was a success!' ;
		Invite.findOne({_id: inviteId}, function(err, invite){
			var y = getIndexOfId(user._id,invite.applicants ) ;
			if(y === -1){
				console.log('No one')
				res.json({success: false})
			}else{
				console.log('invite khoja ja ra hai')
				invite.applicants[y].status.color = 'green' ;
				invite.applicants[y].status.message = 'Your application to this invite was a success!' ;
				var requirements = Number(invite.requirements)-1 ;
				if(requirements>=0){
					console.log(requirements, 'bhag dk bose')
					invite.requirements = requirements.toString() ;
					// requirements handler to not exceed requirements
					user.save(function(err, userSaved){
						if(err){
							res.json({success: false}) ;
						}else{
							invite.save(function(err, inviteSaved){
								if(err){
									res.json({success: false}) ;
								}else{
									res.json({success:true, user: userSaved, invite: inviteSaved});
								}
							})
						}
					})
				}else{
					res.json({success:false, message:'Optimum applications reached!'})
				}
			}
			
		})
	})
})
router.post('/reject_invite',function(req, res, next){
	var username = req.body.userId ;
	var inviteId = req.body.inviteId ;
	User.findOne({username: username}, function(err, user){
		var x = getIndexOfId(inviteId, user.applied_invitations) ;
		user.applied_invitations[x].status.color = 'red' ;
		user.applied_invitations[x].status.message = 'Your application to this invite was rejected!' ;
		Invite.findOne({_id: inviteId}, function(err, invite){
			var y = getIndexOfId(user._id,invite.applicants ) ;
			if(y === -1){
				res.json({success: false})
			}else{
				invite.applicants[y].status.color = 'red' ;
				invite.applicants[y].status.message = 'Your application to this invite was forbidden!' ;
				user.save(function(err, userSaved){
					if(err){
						res.json({success: false}) ;
					}else{
						invite.save(function(err, inviteSaved){
							if(err){
								res.json({success: false}) ;
							}else{
								res.json({success:true, user: userSaved, invite: inviteSaved});
							}
						})
					}
				})
			}
			
		})
	})
})
module.exports = router ;


function getIndexOfId(id, array){
	for(var i=0;i<array.length ;i++){
		if(array[i].id == id)
			return i ;
	}
	return -1 ;
}
/*
Invite.findOne({_id: id}, function(err, inviteFound){
			if(err){
				res.json({success: false, message: 'Invite not found'})
			}else{
				if(findIndexOf({username: user.username, id: user._id}, inviteFound.applicants) === -1){
					inviteFound.applicants.push({username:user.username, id:user._id}) ;
					User.findOne({username: user.username},function(err, user){
						user.applied_invitations.push({id: id}) ;
						user.save(function(err, savedUser){							if(!err){
								inviteFound.save(function(err, savedInvite){
									res.json({success: true, invite: savedInvite})
								})
							}else{

								res.json({success:false})
							}
						})
					})
				}else{
					res.json({success:false, message:'Already Applied'}) ;
				}
			}
		})

*/

function findIndexOf(object, array){
	for(var i=0 ;i<array.length ;i++){
		if((object.username === array[i].username) && (object.id === array[i].id)){
			return i ;
		}
	}
	return -1
}