var mongoose = require('mongoose') ;
var Schema = mongoose.Schema ;
module.exports.initDb = function(){
	mongoose.connect('mongodb://localhost:27017/propart') ;
	var db = mongoose.connection ;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open',function(){
    	console.log('Connected')
    	User = require('../models/User')
    	Invite = require('../models/Invite')
			Chat = require('../models/Chat')
			Online = require('../models/Online')
    })

}

//worke
