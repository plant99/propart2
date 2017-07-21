var mongoose = require('mongoose') ;
var Schema = mongoose.Schema ;

module.exports = mongoose.model('online', new Schema({
	username: String,
	socket_ids:[{
		socket_id: String,
		target: String
	}]
}))
