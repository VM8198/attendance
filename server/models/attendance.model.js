var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var AttendenceSchema = new Schema({
	changed  : {type: String , default : null},
	// userId: { type: Schema.Types.ObjectId , ref: 'User' , autopopulate: true},
	date: {type: Date},
	id: {type: String},
	status: {type: String , default: "absent"},
	diffrence: {type: String , default: "-"}, 
	timeLog: [{
		in : {type: String , default: null},
		out: {type: String , default: "-"},
		_id : false
	}],
	absentCount: {type: String , default: null},
	day : {type : String} 
});
AttendenceSchema.plugin(require('mongoose-autopopulate'));
module.exports = mongoose.model('Attendence' , AttendenceSchema); 
