const Discord = require('discord.js'); 
const client = new Discord.Client();  
const cron = require('node-cron');
const serverId = ""
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
	fetch('http://localhost:4000/attendance/fill-attendance', {
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
	console.log(newStatus.status, newStatus.user.username)
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
		}}
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

client.login('');