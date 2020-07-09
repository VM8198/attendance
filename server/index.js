const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const moment = require('moment');
const http = require("http");
const path = require("path");
const https = require('https');
const fs = require('fs');
var BSONStream = require('bson-stream');
const cron = require('node-cron');
const crontab = require('node-crontab');
var momentTimeZone = require('moment-timezone');


const attendanceModel = require('./models/attendance.model');
const userModel = require('./models/user.model');


//import controllers
var attendanceFunction = require('./callBackFunctions/attendanceFunctions');

const takeAttendanceRoutes = require('./routes/take-attendance.js')
const userRoutes = require('./routes/user');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
	
//https server
// const port = 4000;
// var privateKey = fs.readFileSync('/var/www/html/attendence/ssl/privkey1.pem');
// var certificate = fs.readFileSync('/var/www/html/attendence/ssl/fullchain1.pem');
// var credentials = {key: privateKey, cert: certificate};
// const secureServer = https.createServer(credentials,app);
// secureServer.listen(port);
// console.log("secure server started on 4000");
//18.130.243.169
mongoose.connect('mongodb://localhost/attendance', {useNewUrlParser: true , useUnifiedTopology: true}  )
.then(() => console.log("Congratulations you are connected to Database1"))
.catch(err => console.log(err));

app.use('/attendance' , takeAttendanceRoutes);
app.use('/user' , userRoutes);


app.get('/constant-call', (req,res)=>{
	res.send("called")
})


/*Cron job*/
crontab.scheduleJob("29 18 * * 1-6" , function(){
	console.log("hello");
	// console.log("req . body ===>" , req.body.branch);
	var indiaTime = momentTimeZone().tz("Asia/Kolkata").format()
	var newDate = indiaTime.split("T")[0] + "T18:30:00.000Z";
	// newDate=  moment(newDate).subtract(1, 'days')
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
		}
		])
	.exec((err , foundLogs)=>{
		if(err){
			res.send(err);
		}else{
			userModel.find({userRole : { $ne : 'admin' } , isActive: {$ne: false} })
			.exec(async (err , totalUser)=>{
				if(err){
					res.status(500).send(err);
				}else{
					// foundLogs = await attendanceFunction.properFormatDate(foundLogs);
					console.log("You are in getAttendanceById function" , foundLogs);
					foundLogs.forEach(async (singleRecord)=>{
						lastRecord = singleRecord.timeLog[singleRecord.timeLog.length -1]
						if(lastRecord.out == '-'){
							singleRecord.timeLog[singleRecord.timeLog.length -1].out = moment().utcOffset("+05:30").format('h:mm:ss a');	
							foundAttendence = await attendanceFunction.calculateDifference(singleRecord , singleRecord.timeLog.length -1);
							await attendanceFunction.logOutTimeOfSameDay(singleRecord);
							// .then(fullFilled => {
							// 	var arr = [];
							// 	arr.push(fullFilled)
							// 	return res.status(200).send(arr);
							// })
							// .catch(rejected => {
							// 	console.log(rejected)
							// 	return res.status(500).send(rejected);
							// })
						}
					})
					// res.json({data :foundLogs , presentCount : foundLogs.length , totalUser : totalUser.length});
				}
			});
		}
	});
},{
	schedule: true,
	timezone: "Asia/kolkata"
});





//script to change existing value of database to new value
app.get("/change" ,function(req , res){
	attendanceModel.find({}).exec( (err , foundLogs)=>{
		if(err){
			res.status(404).send(err)
		}else{
			foundLogs.forEach(async function(logs){
				if(moment(logs.date).format('YYYY-MM-DD').split('-')[1] != 10){
					logs.date = moment(logs.date).format('YYYY-MM-DD').split('-')[0] + "-" + moment(logs.date).format('YYYY-MM-DD').split('-')[2] + "-" + moment(logs.date).format('YYYY-MM-DD').split('-')[1] + "T18:30:00.000Z";
					console.log("Newly formatted date =======> " , logs.date);
					logs['changed'] = "changed"
					await attendanceModel.findOneAndUpdate({_id : logs._id} , logs , {upsert : true , new : true});	
					
				}else{
					console.log("Old formated date =========+>" , logs.date);
				}
			})
			res.status(200).send(foundLogs);
		}
	});
});
app.get("/bson-database" ,function(req , res){
	
	fs.readFile('./database/users.bson', (err, data) => {
		if (err) throw err;
		let student = JSON.parse(data);
		// console.log(student);
		// res.send(student);
		attendanceModel.find((err , foundLogs)=>{
			if(err){
				res.send(err);
			}else{
				var newData = [];
				console.log("new data ===>" , student[82])
				// res.send(foundLogs);
				student.forEach(function(studentlogs , index){
					// foundLogs.forEach(function(dataBaseLogs){
						if(studentlogs['date']['$date'] == undefined/*dataBaseLogs['date']*/){
							// if((studentlogs.userId['$oid'] == dataBaseLogs.userId._id)){
								// console.log(studentlogs['date']  , studentlogs.userId['$oid'],"=====" ,dataBaseLogs['date'])
								// console.log(studentlogs['date']['$date'] ,'=== ', studentlogs['date'] , "===" ,index , studentlogs.userId['$oid']);
								// console.log("Match found ======+++>" , foundLogs[index].date , foundLogs[index].userId._id )
							// }
						}else{
								studentlogs['_id'] = studentlogs._id['$oid'];
								studentlogs['userId'] = studentlogs.userId['$oid'];
								studentlogs['date'] = studentlogs['date']['$date'];
								studentlogs['changed'] = "done";
								newData.push(studentlogs);
								// console.log("In else" , studentlogs['date']['$date'] ,'=== ', studentlogs['date'] , "Match" , studentlogs.userId['$oid'] ,index );
						}
					// });
				});
				console.log("ne ware ====>" , newData[0]);
				attendanceModel.insertMany(newData , { ordered: false });
				res.json({"newData" : newData , "length" : newData.length});
			}
		});
	});
	});
app.get("/update-branch" ,function(req , res){
	
	fs.readFile('./database/help.json', (err, data) => {
		if (err) throw err;
		let student = JSON.parse(data);
		console.log(student);
		userModel.find({userRole : { $ne : 'admin' }}).exec((err , foundUsers)=>{
			if(err){
				res.send(err);
			}else{
				foundUsers.forEach(async function(user , index){
					user['branch'] = 'rajkot';
					await userModel.findOneAndUpdate({_id : user._id} , user , {upsert : true , new : true});
				});
				
				// attendanceModel.insertMany(newData , { ordered: false });
				res.json({"newData" : foundUsers , "length" : foundUsers.length});
			}
		});
	});
	});
app.get("/add-user" ,function(req , res){
	
	fs.readFile('./database/help.json', (err, data) => {
		if (err) throw err;
		let student = JSON.parse(data);
		console.log(student);
		userModel.insertMany(student);
		
	});
});




// userModel.find()
// 		.exec((err , foundUsers)=>{
// 			if(err){
// 				console.log(err)
// 			}
// 			else{
// 				foundUsers.forEach(async function(user , index){
// 					user['isActive'] = true;
// 					await userModel.findOneAndUpdate({_id : user._id} , user , {upsert : true , new : true});
// 				});
				
// 			}
// 		});

app.listen(4000);





