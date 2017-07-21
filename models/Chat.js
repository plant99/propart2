var mongoose = require('mongoose') ;
var Schema = mongoose.Schema ;

module.exports = mongoose.model('chat', new Schema({
	participants:[String],
	messages:[{
		author: String,
		message: String,
		timestamp: Date
	}]
}))
