var express = require('express') ;
var router = express.Router() ;

router.post('/invite_visibility', function(req, res, next){
  var username = req.body.user ;
  var invite_id = req.body.id ;
  User.findOne({username: username}, function(err, user){
    if(err){
      res.json({success: false}) ;
    }else{
      if(user){
        user.hidden_invites.push(invite_id) ;
        user.save(function(err, data){
          if(err){
            res.json({success:false}) ;
          }else{
            console.log(data) ;
          }
        })
      }else{
        res.json({success: false, message: 'User doesn\'t exist'}) ;
      }
    }
  })
})
module.exports = router ;
