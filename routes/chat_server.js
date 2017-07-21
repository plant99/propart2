var express = require('express') ;
var router = express.Router() ;
router.get('/:p2', function(req, res, next){
	var p1 = req.decoded._doc.username ;
	var p2 = req.params.p2;
	User.findOne({username: p2}, function(err, user_check){
		if(err){
			res.render('error', {message: err}) ;
		}else{
			if(user_check){
				Chat.findOne({participants:[p1,p2]}, function(err, chat_0){
					if(chat_0){
						res.render('chat',{chat:chat_0,host:p1, guest:p2})
						add_to_recent(p1,p2) ;
					}else{
						Chat.findOne({participants:[p2,p1]}, function(err, chat_1){
								if(err){
									res.render('error', {message: 'Couldn\'t load chat, sorry!'})
								}else{
									add_to_recent(p1,p2) ;
									if(chat_1){
										res.render('chat',{chat:chat_1, host:p1, guest:p2})
									}else{
										var chat = new Chat({
											participants:[p1,p2],
											messages:[]
										})
										chat.save(function(err, chatSaved){
											res.render('chat',{chat:chat, host:p1, guest:p2}) ;
										})
									}
								}
						})
					}
				})
			}else{
				res.render('error', {message: 'User not found for chat'}) ;
			}
		}
	})
})

module.exports = router;


function add_to_recent(p1, p2){
	User.findOne({username:p1}, function(err, part1){
		console.log('Control came here!', part1) ;
		if(err){
			console.log(err) ;
		}else{
			if(part1.recent_conversations.indexOf(p2) == -1){
				console.log('Control came here!', part1) ;
				console.log('At least not -1') ;
				if(part1.recent_conversations.length>=5){
					part1.recent_conversations.splice(0,1) ;
				}
				part1.recent_conversations.push(p2) ;
				part1.save(function(){
					User.findOne({username: p2}, function(err, part2){
						if(part2.recent_conversations.indexOf(p1) != -1){
							console.log('At least not -1,2') ;
							if(part2.recent_conversations.length>=5){
								part2.recent_conversations.splice(0,1) ;
							}
							part2.recent_conversations.push(p1) ;
							part2.save();
						}
					})
				})
			}else{
				console.log(part1.recent_conversations, p2) ;
			}
		}
	})
}
