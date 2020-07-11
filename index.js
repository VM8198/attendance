const Discord = require('discord.js'); 
const client = new Discord.Client();  
const cron = require('node-cron');
const serverId = "serverId"
const fetch = require("node-fetch");

let users = [{
	user: '',
	id: ''
}]

getAllUsersStatus = () => {
	const guild = client.guilds.cache.get(serverId)
	guild.members.cache.forEach(member => 
	console.log("===>>>",member.user.username, member.user.id)
		// users.push({
		// 	user: member.user.username
		// 		// time: moment().format("DD/MM/YYYY hh:mm:ss a")
		// 	})
		);
}

fillAttendance = (newStatus) => {
	fetch('https://discord-attendance.mylionsgroup.com:5000/attendance/fill-attendance', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
		    	body: JSON.stringify({"id": newStatus.user.id}), // string or object
		    })
		.then((res) => res.json())
		.then((data) =>{ 
			console.log(data)	
		})
		.catch((err) => {
			console.log("Error===>>>",err)
		})
}

client.on("presenceUpdate", (oldStatus, newStatus) => {
	console.log("oldStatus===>>>", oldStatus)
	console.log(newStatus.status, newStatus.user.username, newStatus.user.id)
	newUserId = newStatus.user.id; 
	if( 
		newUserId == "654909364657848375" || 
		newUserId == "694058124977635328" || 
		newUserId == "658976278858170378" || 
		newUserId == "494177474192736270" || 
		newUserId == "655380749482197002" ||
		newUserId == "731039156830208071" ||
		newUserId == "646628303683321866" ||
		newUserId == "686564035281289290" ||
		newUserId == "603230461791174667" ||
		newUserId == "655327454277140500"
	)
	{
		console.log("Admin users")
	}else {

		if(oldStatus){
			if(newStatus.status == "idle"){
				console.log("-------------")
			} else if (oldStatus.status == "idle" && newStatus.status == "online"){
				console.log("-------------")
			} else if(oldStatus.status == "idle" && newStatus.status == "offline"){
				console.log("API call")
				fillAttendance(newStatus)		
			} else if(oldStatus.status == "online" && newStatus.status == "offline"){
				console.log("API call")
				fillAttendance(newStatus)
			} else if(oldStatus.status == "offline" && newStatus.status == "online"){
				console.log("API call")
				fillAttendance(newStatus)
			}
		}	
	}
	
});

client.on('ready', () => {   
	console.log(`Logged in as ${client.user.tag}!`);
	// getAllUsersStatus()	
	// updateUsers();
});

client.on('guildMemberUpdate', (update) => {
	console.log("=======>>>>>>> in update function <<<<<<<========")
})

client.on('message', msg => {  
	if(msg.author.bot) return;

	if (msg.content === 'ping') {     
		for(let i = 0 ; i < users.length ; i ++){
			msg.reply(users[i].user, users[i].status, users[i].time);   
		}
	}

	if (msg.content === 'koala') {
		msg.reply('This is a koala!', {files: ['https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Koala_climbing_tree.jpg/480px-Koala_climbing_tree.jpg']});
	}

});

client.login('token');