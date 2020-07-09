var attendanceModel = require('../models/attendance.model');
var userModel = require('../models/user.model');
var moment = require('moment');
var take_attendance = {};
const ObjectId = require('mongodb').ObjectId;
var attendanceFunction = require('../callBackFunctions/attendanceFunctions');
var macfromip = require('macfromip');
const os=require('os');  

var momentTimeZone = require('moment-timezone');




take_attendance.fillAttendance = function(req , res){
	console.log("req body of fill attendence " , req.body.userId);

	if(req.body.userId == 'Pushpraj'){
		req.body.userId ="5d92eda76b6aa2362ba8aa1c"
	}
	// res.send("DONE");
	userModel.findOne({id : req.body.userId} ,async (err , foundUser)=>{
		console.log("found user", foundUser);
		if(err){
			console.log("error in finding student" , err);
			res.status(400).send(err);
		}
		else{
			if(req.body.loginFlag == false && foundUser.userRole != 'admin' && !req.body.isFaceRecognition){
				await attendanceFunction.unauthorizedIPLoginEmail(foundUser);
			}
			console.log("working");
			var date = new RegExp( moment().toISOString().split("T")[0],'g');
			var indiaTime = momentTimeZone().tz("Asia/Kolkata").format();
			console.log("Date ==============+++++>" , new Date().toISOString() , "Only Fsyr ====>" , 	indiaTime.split("T")[0] + "T18:30:00.000Z");
			// var momentISO = moment().utcOffset("+05:30").format('h:mm:ss a')
			var newDate = indiaTime.split("T")[0] + "T18:30:00.000Z";

			try{
				attendanceModel.findOne({id: req.body.userId})
				// .populate('userId')
				.exec( async (err , foundAttendence)=>{
					console.log("Found attendacne baro baar ====================================+> ", foundAttendence)
					if(err){
						res.status(500).send(err);
					}
					else if(foundAttendence != null){
						var timeLogLength = foundAttendence.timeLog.length - 1;
						var lastRecord = foundAttendence.timeLog[timeLogLength].out;
						switch (req.body.api_of){
							case "attendance_in":
								console.log("in attendance in");
								if(lastRecord =="-"){
									return res.send("Your attendance is already marked in");
								}	
								break;
							case "attendance_out":
								if(lastRecord !="-"){
									return res.send("Please mark your attendance first. You already marked your attendance.");
								}
								else{
									console.log("in attendance out");
									foundAttendence.timeLog[timeLogLength].out = moment().utcOffset("+05:30").format('h:mm:ss a');	
									foundAttendence = await attendanceFunction.calculateDifference(foundAttendence , timeLogLength);
									attendanceFunction.logOutTimeOfSameDay(foundAttendence)
									.then(fullFilled => {
										var arr = [];
										arr.push(fullFilled)
										return res.status(200).send(arr);
									})
									.catch(rejected => {
										console.log(rejected)
										return res.status(500).send(rejected);
									})
								}
								// return res.send("in attendance out");
								break;
						}
						if(lastRecord !="-" && !req.body.api_of){
							attendanceFunction.logNewAttendanceOfSameDay(foundAttendence)
							.then(fullFilled => {
								var arr = [];
								arr.push(fullFilled)
								res.status(200).send(arr);
							})
							.catch(rejected => {
								console.log(rejected)
								res.status(500).send(rejected);
							});
						}
						else if(!req.body.api_of){
							console.log("Found attandance =====> ", foundAttendence)
							if(req.body.lastLog){
								foundAttendence.timeLog[timeLogLength].out = req.body.lastLog;
							}
							else{
								foundAttendence.timeLog[timeLogLength].out = moment().utcOffset("+05:30").format('h:mm:ss a');
							}
							foundAttendence = await attendanceFunction.calculateDifference(foundAttendence , timeLogLength);
							attendanceFunction.logOutTimeOfSameDay(foundAttendence)
							.then(fullFilled => {
								var arr = [];
								arr.push(fullFilled)
								res.status(200).send(arr);
							})
							.catch(rejected => {
								console.log(rejected)
								res.status(500).send(rejected);
							})
							// attendanceModel.findOneAndUpdate({date: foundAttendence.date , userId: foundAttendence.userId._id} , {$set: foundAttendence} , {upsert: true , new: true} , (err , updatedLog)=>{
							// 	if(err){
							// 		res.status(500).send(err);
							// 	}
							// 	else{
							// 		var arr = [];
							// 		arr.push(updatedLog)
							// 		res.status(200).send(arr);
							// 	}
							// });
						}
					}
					else{
						req.body =  await attendanceFunction.newAttendance(req.body);
						var attendence = new attendanceModel(req.body);
						attendence.save(async(err , savedAttendence)=>{
							if(err){
								res.status(500).send(err);
								console.log("err", err)
							}
							else{
								console.log("NEW ATTENDACEE +++++++++++++++++." ,savedAttendence);
								var arr = [];
								arr.push(savedAttendence);

								res.status(200).send(arr);
							}
						});
					}
				});

			}catch(e){
				console.log(e);	
			}
		}
	});
}

take_attendance.getAttendanceById =  function(req , res){
	console.log("Inside getAttendanceById ==========+++>" , req.body);
	if(req.body.days){
		console.log("You are in getAttendanceById function if days are given" , req.body.userId);
		var someDate = new Date();
		var numberOfDaysToAdd = -5;
		someDate.setDate(someDate.getDate() + numberOfDaysToAdd); 
		console.log("to" , new Date().toISOString().split("T")[0] + "T18:30:00.000Z");
		console.log("from" , someDate.toISOString().split("T")[0] + "T18:30:00.000Z");
		var from = someDate.toISOString().split("T")[0] + "T18:30:00.000Z";

		var indiaTime = momentTimeZone().tz("Asia/Kolkata").format()
		var to =  indiaTime.split("T")[0] + "T18:30:00.000Z"
		console.log("From" , from);
		console.log("To" , to);
		attendanceModel.find(
			{ date : { $gte: from  , $lte :  to } , userId : { $eq : req.body.userId } }
			)
		.lean()
		.exec(async(err , foundLogs)=>{
			if(err){
				res.send(err);
			}else if(foundLogs.length){
				// console.log("foundLogs of last five days IF =======++>" , foundLogs)
				var got = await  attendanceFunction.calculateTimeLog(foundLogs , 5 , foundLogs[0].date , foundLogs[foundLogs.length - 1].date);
				// console.log("Got ==========================>" , got);

				console.log("Found logs of get Attendance By Id" , foundLogs);
				res.json({
					"foundLogs" : foundLogs,
					"TotalHoursCompleted" : got.TotalHoursCompleted,
					"TotalHoursToComplete" : got.TotalHoursToComplete
				});
				// res.send(foundLogs);
			}else{
				res.json({"message" : "No logs found"})
			}
		});
	}else{
		var indiaTime = momentTimeZone().tz("Asia/Kolkata").format()
		var newDate = indiaTime.split("T")[0] + "T18:30:00.000Z";
		console.log("You are in getAttendanceById function" , req.body.userId);
		attendanceModel.find( { date :  newDate   , userId: req.body.userId} 
			)
		.exec((err , foundLogs)=>{
			if(err){
				res.send(err);
			}else{
				console.log("You are in getAttendanceById function else ***************" , foundLogs);
				res.send(foundLogs);
			}
		});
	}
}

take_attendance.getCurrentMonthLogByPage = function(req , res){
	console.log("body of pagination " , req.body);
	if(!req.body.date){
		console.log( new Date().toISOString().split("T")[0]/* + "T18:30:00.000Z"*/);
		date =  moment(req.body.date).format("DD/MM/YYYY").split("/")[2] + "-" + moment(req.body.date).format("DD/MM/YYYY").split("/")[1] 	;
		date = new RegExp( date , 'g');
		// date = "/"+date+"/"
		console.log(date);
	}else{
		console.log(moment(req.body.date).format("DD/MM/YYYY").split("/"));
		date = moment(req.body.date).format("DD/MM/YYYY").split("/")[1] + "-"+ moment(req.body.date).format("DD/MM/YYYY").split("/")[2];
		date = new RegExp('\/'+ date + '\/','g');
		console.log(date);
	}


	if(req.body && req.body == 'admin'){
		console.log("ADMIN");
	}else{
		console.log("EMPLOYEE");
		var skip = 0;
		if(req.body.page == 1){
			skip = 0
		}else{
			skip = Number(req.body.page) * 5 - 5;
		}
		attendanceModel.find({userId : req.body.userId})
		.sort({_id : -1})
		.limit(1 * 5)
		.skip(skip)
		.exec(async(err , foundLogs)=>{
			if(err){
				res.send(err);
			}else{
			
				var got = await  attendanceFunction.calculateTimeLog(foundLogs , 5 , foundLogs[0].date , foundLogs[foundLogs.length - 1].date);
				// console.log("Got ==========================>" , got);


				res.json({
					"foundLogs" : foundLogs,
					"TotalHoursCompleted" : got.TotalHoursCompleted,
					"TotalHoursToComplete" : got.TotalHoursToComplete
				});
				// res.send(foundLogs);
			}
		});	
	}
}



//imported 
//Not needed 

//Done
take_attendance.getLogBySingleDate = function(req , res){
	console.log(" ==========+++++>getLogBySingleDate " , new Date(req.body.firstDate).toISOString().split("T")[0] + "T18:30:00.000Z");
	var newDate = new Date(req.body.firstDate).toISOString().split("T")[0] + "T18:30:00.000Z";
	console.log("new Date =====++>" , newDate , typeof newDate);
	attendanceModel.aggregate([
		{ $match: { date: new Date(newDate)} },
		{
			$lookup:
			{
				from: "users",
				localField: "userId",
				foreignField: "_id",
				as: "user"
			}
		},
		{
			$addFields: {
				user: {
					$filter: {
						input: "$user",
						as: "comp",
						cond: {
							$eq: [ "$$comp.branch", req.body.branch ]
						}
					}
				}
			}
		},
		{
			$addFields: {
				length: {
					$size : "$user"
				}
			}
		},
		{
			$match : {
				length : { 
					$gt:  0
				}
			}
		}
	])
	.exec(async(err , foundLogs)=>{
		if(err){
			res.send(err);
		}else{
			foundLogs = await attendanceFunction.properFormatDate(foundLogs);	
			res.send(foundLogs);
		}
	});
}
//done below controller
take_attendance.getTodaysattendance = function(req , res){
	console.log("req . body ===>" , req.body.branch);
	var indiaTime = momentTimeZone().tz("Asia/Kolkata").format()
	var newDate = indiaTime.split("T")[0] + "T18:30:00.000Z";
	console.log("new Date" , newDate,typeof newDate ,new Date(newDate));
	attendanceModel.aggregate([
		{ $match: { date: new Date(newDate) } },
		{
			$lookup:
			{
				from: "users",
				localField: "userId",
				foreignField: "_id",
				as: "user"
			}
		},
		{
			$addFields: {
				user: {
					$filter: {
						input: "$user",
						as: "comp",
						cond: {
							$eq: [ "$$comp.branch", req.body.branch ]
						}
					}
				}
			}
		},
		{
			$addFields: {
				length: {
					$size : "$user"
				}
			}
		},
		{
			$match : {
				length : { 
					$gt:  0
				}
			}
		}
	])
	.exec((err , foundLogs)=>{
		if(err){
			res.send(err);
		}else{
			userModel.find({userRole : { $ne : 'admin' } , branch : { $eq : req.body.branch }, isActive: {$ne: false} })
			.exec(async (err , totalUser)=>{
				if(err){
					res.status(500).send(err);
				}else{
					// foundLogs = await attendanceFunction.properFormatDate(foundLogs);
					console.log("You are in getAttendanceById function" , foundLogs);
					res.json({data :foundLogs , presentCount : foundLogs.length , totalUser : totalUser.length});
				}
			});
		}
	});	
}
take_attendance.getReportById = async function(req , res){
	if(!req.body.flag){
		console.log("In the success" ,  req.body);
		req.body.startDate = req.body.startDate.split("T")[0] + "T18:30:00.000Z";
		endDate = req.body.endDate.split("T")[0] + "T18:30:00.000Z";
		var totalHoursToWork = await attendanceFunction.calculateResultHours(req.body.startDate, endDate);
	
	}else{
		endDate = req.body.endDate +  "T18:30:00.000Z"; 
		req.body.startDate = req.body.startDate +  "T18:30:00.000Z";
		var totalHoursToWork = await attendanceFunction.calculateResultHours(req.body.startDate, endDate);
	}
	
	
	console.log("In the success" ,  req.body.startDate , endDate);
	// attendanceModel.find(
	// 	{ date : { $gte: req.body.startDate  , $lte :  endDate } , userId : { $eq : req.body.userId } }
	// 	)
	attendanceModel.aggregate(
			[
			{
				$lookup:
				{
					from: "users",
					localField: "userId",
					foreignField: "_id",
					as: "user"
				}
			},
			{
				$match : {
					date : { 
						$gte:  new Date(req.body.startDate),
						$lte: new Date(endDate)
					},
					userId : {
						$eq: ObjectId(req.body.userId)
					},
					
				} 
			}
			]
			)
	.sort({_id : 1})
	.exec(async (err , foundLogs)=>{
		if(err){
			console.log("getting error in line 302",err);
			res.send(err);
		}else if(foundLogs.length){
			var got = await  attendanceFunction.calculateTimeLog(foundLogs  , req.body.startDate , endDate);
			// var foundLogs = await attendanceFunction.properFormatDate(foundLogs);
			foundLogs = await attendanceFunction.formatMonthAccordingToDaysSingleEmployee(foundLogs, req.body.startDate, endDate);
			got['foundLogs'] = foundLogs;
			got['TotalHoursToComplete'] = totalHoursToWork
			res.send(got);
		}else{
			console.log("getting nothing")
			res.send([]);
		}
	});
}

take_attendance.getReportByFlag = async function(req , res){
	req.body.endDate = req.body.endDate.split('T')[0] +   "T18:30:00.000Z"; 
	console.log("body of get report by flag =====>" , req.body);
	if(req.body.id == 'All'){
		console.log("al")
		attendanceModel.aggregate([
		{
			$match : {
				date : { 
					$gte:  new Date(req.body.startDate),
					$lte: new Date(req.body.endDate)
				}
			} 
		},
		{
			$sort: { 
				"date": -1 
			}
		},	
		{
			$lookup:
			{
				from: "users",
				localField: "userId",
				foreignField: "_id",
				as: "user"
			}
		},
		{
			$addFields: {
				user: {
					$filter: {
						input: "$user",
						as: "comp",
						cond: {
							$eq: [ "$$comp.branch", req.body.branch ]
						}
					}
				}
			}
		},
		{
			$addFields: {
				length: {
					$size : "$user"
				}
			}
		},
		{
			$match : {
				length : { 
					$gt:  0
				}
			}
		},	
		{
			$group: {
				_id: { $dateToString: { format: "%d-%m-%Y", date: "$date" } },
				data: { $push: "$$ROOT" }
			}
		},
		{
			$group: {
				_id: null,
				data: {
					$push: {
						k: "$_id",
						v: "$data"
					}
				}
			}
		},
		{
			$replaceRoot: {
				newRoot: { $arrayToObject: "$data" }
			}
		}
		])
		// .sort({date: -1})
		.exec(async function (err , foundLogs) {
			if(err){
				console.log(err);
				return(res.status(500).send(err));
			}else{
				console.log("foundLogs of all employee " , foundLogs);
				console.log(123);
				if(foundLogs.length != 0)
					foundLogs = await attendanceFunction.formatMonthAccordingToDays(foundLogs , req.body.startDate , req.body.endDate);
				res.status(200).send(foundLogs);
			}
		});
	}else{
		var totalHoursToWork = await attendanceFunction.calculateResultHours(req.body.startDate, req.body.endDate);
		console.log("Inside ekse");
		attendanceModel.aggregate(
			[
			{
				$lookup:
				{
					from: "users",
					localField: "userId",
					foreignField: "_id",
					as: "user"
				}
			},
			{
				$match : {
					date : { 
						$gte:  new Date(req.body.startDate),
						$lte: new Date(req.body.endDate)
					},
					userId : {
						$eq: ObjectId(req.body.id)
					}
				} 
			}
			]
			)
		.exec(async(err , foundLogs)=>{
			if(err){
				return(res.status(500).send(err));
			}else{
				if(foundLogs.length){
					var got = await  attendanceFunction.calculateTimeLog(foundLogs  , req.body.startDate , req.body.endDate);
					// var foundLogs = await attendanceFunction.properFormatDate(foundLogs);
					foundLogs = await attendanceFunction.formatMonthAccordingToDaysSingleEmployee(foundLogs, req.body.startDate, req.body.endDate);
					got['foundLogs'] = foundLogs;
					got['TotalHoursToComplete'] = totalHoursToWork
					res.send(got);
				}else{
					return(res.status(200).send(foundLogs));
				}
			}
		});
	}
}

module.exports = take_attendance;