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
            res.json({success:true})
          }
        })
      }else{
        res.json({success: false, message: 'User doesn\'t exist'}) ;
      }
    }
  })
})
router.post('/applied_invite_visibility', function(req, res){
  var user = req.body.user ;
  var invite_id = req.body.id ;
  User.findOne({username: user}, function(err, user_found){
    if(err){
      res.json({success: false}) ;
    }else{
      if(user_found){
        user_found.hidden_invites.push(invite_id) ;
        user_found.save(function(err, user_saved){
          console.log(user_saved) ;
          if(err){
            res.json({success: false}) ;
          }else{
            res.json({success: true}) ;
          }
        })
      }
    }
  })
})
router.post('/invite', function(req, res){
  var id = req.body.id ;
  console.log('Post recieved')
  Invite.findOne({_id: id}, function(err, invite){
    if(err){
      console.log(err) ;
    }else{
      if(invite){
        console.log(invite) ;
        var author = invite.author.name ;
        User.findOne({username: author}, function(err, author_searched){
          console.log('Author found') ;
          //clear invite from User's active_invitations
          var active_invitations = author_searched.active_invitations ;
          var index_ai = active_invitations.indexOf(invite._id) ;
          author_searched.active_invitations.splice(index_ai,1) ;
          var applicants = invite.applicants ;
          if(applicants.length){
            for(var i=0;i< applicants.length;i++){

              //clear invite from each applicants applied_invitations
              User.findOne({username: applicants[i].username}, function(err, applicant_searched){
                if(applicant_searched){
                  var index_of_application = findIndexOfId(invite._id, applicant_searched.applied_invitations) ;
                  if(index_of_application != (-1)){
                    console.log('Great, ain\'t available!') ;
                  }else{
                    applicant_searched.applied_invitations.splice(index_of_application,1) ;
                  }
                  applicant_searched.save() ;
                }else {
                  console.log('applicant not found!') ;
                }
              })
              if(i == applicants.length-1){
                //clear the invite itself and save everything
                Invite.remove({_id: invite._id}, function(err){
                  if(err){
                    res.json({success: false}) ;
                  }else{
                    author_searched.save(function(err){
                      res.json({success:true })
                      console.log('succesful') ;
                    }) ;
                  }
                })
              }
            }
          }else{
            //clear the invite itself and save everything when there's no applicants
            Invite.remove({_id: invite._id}, function(err){
              if(err){
                res.json({success: false}) ;
              }else{
                author_searched.save(function(err){
                  res.json({success:true })
                  console.log('succesful') ;
                }) ;
              }
            })
          }
        })
      }else{
        console.log('Sorry, Idk invite unavailable') ;
      }
    }
  })
})
module.exports = router ;

function findIndexOfId(id, array){
  for(var i=0;i< array.length ;i++){
    if(array[i].id === id){
      return i;
    }
  }
  return -1 ;
}
