var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = new Schema({
	email: {type: String},
	name : {type: String},
	password: {type: String},
	id: {type: String},
	designation: {type: String},
	userRole : {type : String , default: 'employee'},
	branch : {type : String , default: null},
	isActive: {type:Boolean , default: true}
});
 

module.exports = mongoose.model('User' , UserSchema); 