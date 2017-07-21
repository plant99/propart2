var mongoose = require('mongoose') ;
var Schema = mongoose.Schema ;

module.exports = mongoose.model('user', new Schema({
	name: String,
	course: String,
	branch: String,
	rollno: String,
	username: String ,
	password: String ,
	active_invitations: Array,
	image: String,
	applied_invitations: [{
		id: String,
		status:{
			color:String,
			message: String
		}
	}],
	conversations:[{
		username: String,
		unread: Boolean
	}],
	hidden_invites:[String],
	recent_conversations:[String] 
}))
