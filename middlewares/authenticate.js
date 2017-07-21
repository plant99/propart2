var jwt = require('jsonwebtoken')

module.exports = function(req,res,next){
	var token = req.body.token || req.headers['x-access-token'] || req.query.token || req.cookies.token
	if(token){
		jwt.verify(token, superSecret, function(err, decoded){
			console.log(err) ;
			if(err){
				res.render('error', {
					message: 'Login wasn\'t a success, try again'
				})
			}else{	
				req.decoded = decoded ;
				if(!req.decoded._doc.image){
					req.decoded._doc.image = 'defaultImage.jpg'
				}
				next() ;
			}
		})
	}else{
		res.redirect('/login')
	}
}