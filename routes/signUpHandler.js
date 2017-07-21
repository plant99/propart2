var express = require('express')
var router = express.Router() ;
var bcrypt = require('bcrypt');
var captchapng = require('captchapng')
var request = require('request')
router.post('/',function(req,res,next){
	var response = req.body['g-recaptcha-response'] ;
	var options = {
		method: 'post',
		url:'https://www.google.com/recaptcha/api/siteverify',
		json: true ,
		form:{
			secret:'6Leb1CcUAAAAAIfiWD5G4HRQ-JJAZ3dt1Bp3v3nL',
			response: response,
			remoteip: req.connection.remoteAddress
		}
	}
	
	request(options, function(error, response, body){
		if(body){
			if(body.success != false){
				User.findOne({username:req.body.username},function(err, user){
				if(user){
					res.render('signup',{message:'User with the same username exists, you might want to login'})
				}else{
					if(req.files){
						if(req.files.profile_photo){
							sampleFile = req.files.profile_photo ;
							var nameOfImage = sampleFile.name ;
							var extension = nameOfImage.split('.').pop() ;
							if(extension === 'jpg' || extension === 'jpeg' || extension === 'png'){
								sampleFile.mv(__dirname+'/../images/'+ req.body.username +'.'+sampleFile.name.split('.')[1], function(err){
									if(err){
										console.log(err)
									}
								})
							}
							
						}
					}
					var bcrypt = require('bcrypt');
					const saltRounds = 10;
					const myPlaintextPassword = req.body.password;
					var body = req.body ;
					bcrypt.hash(myPlaintextPassword, saltRounds, function(err, hash) {
		  				var user = User({
		  					name: body.name,
							course: body.course,
							branch: body.branch,
							rollno: body.rollno,
							username: body.username ,
							password: hash ,
							active_invitations: [],
							image: '',
							applied_invitations: []
		  				})
		  				if(req.files.profile_photo){
		  					user.image = req.body.username + '.'  + req.files.profile_photo.name.split('.').pop() ;
		  				}
						user.save() ;
					});

					setTimeout(function(){
						res.redirect('/login')
					},1000)
				 }
				})
			}else{
				res.render('signup',{message:'Wrong response to captcha'})
			}
		}else{
			res.render('signup',{message:'Captcha not attempted'})
		}
	})


		
})
router.post('/check_availability', function(req, res, next){
	User.findOne({username: req.body.username}, function(err, user){
		if(err){
			res.render('error',{message:'Couldn\'t save, try again'})
		}else{
			if(user){
				res.json({canUse: false})
			}else{
				res.json({canUse: true})
			}
		}
	})
})

router.get('/',function(req, res, next){
	res.render('signup', {message:''})
})

module.exports = router ;


/*
console.log('Signup hai bhai')
	console.log(req.body.username)
	var response = req.body['g-recaptcha-response'] ;
	console.log(response)
	var options = {
		method: 'post',
		url:'https://www.google.com/recaptcha/api/siteverify',
		json: true ,
		form:{
			secret:'6Leb1CcUAAAAAIfiWD5G4HRQ-JJAZ3dt1Bp3v3nL',
			response: response,
			remoteip: req.connection.remoteAddress
		}
	}
	
	request(options, function(error, response, body){
		console.log(body)
		if(body.success != 'false'){
			User.findOne({username:req.body.username},function(err, user){
			if(user){
				console.log('Rendering with a message')
				console.log(user)
				var valicode = new Buffer(captchaImg()).toString('base64')
				res.render('signup',{message:'User with the same username exists, you might want to login'})
			}else{
				var bcrypt = require('bcrypt');
				const saltRounds = 10;
				const myPlaintextPassword = req.body.password;
				var body = req.body ;
				bcrypt.hash(myPlaintextPassword, saltRounds, function(err, hash) {
	  				var user = User({
	  					name: body.name,
						course: body.course,
						branch: body.branch,
						rollno: body.rollno,
						username: body.username ,
						password: hash ,
						active_invitations: [],
						image: ''
	  				})
					user.save(function(){
						console.log('Why cant you da?', user, user.__proto__.connections)
					}) ;
					console.log(User)
					setTimeout(function(){
						res.redirect('/login')
					},1000)
				});
				if(req.files){
					console.log(req.files)
					if(req.files.profile_photo){
						console.log(req.files.profile_photo)
						sampleFile = req.files.profile_photo ;
						if(sampleFile){
							if(sampleFile.name){
								sampleFile.mv(__dirname+'/../images/'+ req.body.username +'.'+sampleFile.name.split('.')[1], function(err){
									if(err){
										console.log(err)
									}else{
										User.findOne({username:req.body.username},function(err, user){
											if(user){
												user.image = req.body.username +'.'+sampleFile.name.split('.')[1] ;
												user.save() ;
											}
										})
									}
								} )
							}
						}
					}
				}
			}
			})
		}else{
			res.render('signup',{message:'Wrong response to captcha'})
		}
	})



*/