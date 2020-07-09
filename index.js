const Discord = require('discord.js'); 
const client = new Discord.Client();  
const cron = require('node-cron');
const serverId = "702388774365036565"
const fetch = require("node-fetch");

// var moment = require('moment');

let users = [{
	user: '',
	status: ''
}]

getAllUsersStatus = () => {
	const guild = client.guilds.cache.get(serverId)
	guild.members.cache.forEach(member => 
		users.push({
			user: member.user.username
				// time: moment().format("DD/MM/YYYY hh:mm:ss a")
			})
		);
	console.log("===>>>",users)
}

client.on("presenceUpdate", (oldStatus, newStatus) => {
	fetch('http://localhost:4000/attendance/fill-attendance', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
	    	body: JSON.stringify({"userId": newStatus.user.id}), // string or object
	    })
	.then((res) => res.json())
	.then((data) =>{ 
		console.log(data)
	})
	.catch((err) => {
		console.log("Error===>>>",err)
	})
});

client.on('ready', () => {   
	console.log(`Logged in as ${client.user.tag}!`);
	getAllUsersStatus()	
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

client.login('NzI5OTg0MDA1NzQyNjU3NTQ4.XwQ48w.tE0eRGKvXh0dgSzeWrXerRnu014');