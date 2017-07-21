var mongoose = require('mongoose') ;
var Schema = mongoose.Schema ;

module.exports = mongoose.model('invite', new Schema({
	category: String,
	title: String,
	description: String,
	requirements: String,
	author: {
		name:String,
		image:String
	},
	applicants: [{
		username: String,
		id: String,
		status: {
			color: String,
			message: String
		}
	}]
}))