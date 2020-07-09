var userModel = require('../models/user.model');
var userController = {};
const ObjectId = require('mongodb').ObjectId;
const lodash = require('lodash');
const moment = require('moment');	
var attendanceFunction = require('../callBackFunctions/attendanceFunctions');

userController.signUp = function(req,res){
	userModel.findOne({email : req.body.email} , (err , foundUser)=>{
			console.log("found USer =======+>" , foundUser)
			if(err){
				res.status(400).send(err);
			}
			else if(foundUser){
				res.status(500).send("Email already exists");
			}
			else{
				var newUser = new userModel(req.body);
				newUser.save((err , userSaved)=>{
					if(err){
						res.status(400).send(err);
					}
					else{
						console.log("userSaved =========> " , userSaved);
						res.json({user: userSaved});
					}
				});		
			}
	});
	
}
userController.login = function(req,res){
	console.log("Req. body of login ===========>" , req.body.email , "=======++> " , req.body.password , req.body);
	userModel.findOne({email: req.body.email , password: req.body.password } ,async (err,foundUser)=>{
		if(err){
			console.log("err ");
			res.status(404).send(err);
		}
		else if(foundUser == null){
			console.log("foundUser == null");	
			response =  "Bad request"
			res.status(400).send(err);

		}
		else{
			
			if(req.body.flag == false && foundUser.userRole != 'admin'){
				// await attendanceFunction.unauthorizedIPLoginEmail(foundUser);
			}
			res.status(200).send(foundUser);
		}
	});
}
userController.getUsers = function(req,res){
	console.log("Req. body of getUSes ===========>" , req.body);

	userModel.find({ designation: {$ne: 'Admin'}  , branch : {$eq : req.body.branch}, isActive : {$ne: false}} , 'name designation _id email' )
	.sort({name : 1})
	.exec((err,users)=>{
		if(err){
			res.status(400).send(err);
		}
		else{
			console.log("user",users);
			res.status(200).send(users);
		}
	})
}

userController.getUserById = function(req,res){
	console.log("Req. body of get user By ID ===========>" , req.params);

	userModel.findOne({_id : req.params.id} , (err  , foundLog)=>{
		if(err){
			res.status(404).send(err);
		}
		else{
			if(err){
				response  = { message :  "No User Found"};
					res.status(400).send(response);	
			}
			else{
				res.status(200).send(foundLog);
			}
		}
	});
}

userController.updateUserById = function(req,res){
	console.log("EHEY")
	console.log("req body of update user by Id" , req.body);
	// userModel.findAndModify({
	// 	query: { _id: req.params.id},
	// 	update: req.body
	// }, function())
	// .exec((updatedUser , err)=>{
	// 	if(err){
	// 		console.log("Error in updated user ============>", err)
	// 		res.status(400).send(err);
	// 	}
	// 	else{
	// 		console.log("UPDATED USER ===========>", updatedUser)
	// 		res.status(200).send(updatedUser);
	// 	}
	// });
	userModel.findOneAndUpdate({_id: req.params.id} , req.body , {upsert: true, new: true} , (err , updatedUser)=>{
		if(err){
			console.log("Error in updated user ============>", err)
			res.status(400).send(err);
		}
		else{
			res.status(200).send(updatedUser);
		}
	});
}	

userController.deleteUserById = function(req,res){
	console.log("Req. body of delete ===========>" , req.body);
	
	userModel.findOneAndUpdate({_id : req.params.id} , {$set : { isActive: false }}  ,{upsert: true, new:true} ,(err, removedUser)=>{
		if(err){
			res.status(404).send(err);
		}
		else{
			if(removedUser == null){
				response  = { message :  "No User Found"};
				res.status(400).send(response);
			}
			else{
				response  = { message :  "User Deleted Succesfully"};
				res.status(200).send(removedUser);
			}
		}
	});	
}
module.exports = userController;