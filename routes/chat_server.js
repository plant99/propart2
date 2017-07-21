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
					}else{
						Chat.findOne({participants:[p2,p1]}, function(err, chat_1){
								if(err){
									res.render('error', {message: 'Couldn\'t load chat, sorry!'})
								}else{
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
