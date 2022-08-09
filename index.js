// Require the necessary discord.js classes
const { Client } = require('discord.js');
const { token, me, sid } = require('./config.json');
const client = new Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });
var rep;

client.once('ready', () => {
	console.log('Ready!');
});

function utry(func, fail) {
	try {
		func();
	} catch (e) {
		if(fail != undefined) {
			fail(e);
		}
	}
}

// var me = "568886465052803082"
// var sid = "689628070654771349"

client.on('messageCreate', (msg) => {
	if(msg.author.bot) return;
	if(!msg.content.startsWith(',')) return;
	
	let flags = msg.content.split(" ");
	flags.shift()
	let cmd = msg.content.split(" ")[0].substring(1);
	
	// ,ping 0<User> every 2<Float> seconds 4<Int> times
	// ,dm
	if (cmd === 'ping' || cmd === 'dm') {
		let person = flags[0];
		let interval = 2;
		let times = 10;
		
		if(person.substring(2, person.length - 1) == me && msg.author.id != me) {
			msg.reply("haha u dumb fuck")
			return
		}
		if(person.substring(2, person.length - 1) == sid && msg.author.id != sid && msg.author.id != me){
			msg.reply("no sorry lets not make him angry")
			return
		}
		if (flags[2] != undefined) {
			interval = parseInt(flags[2]);
			if(!Number.isInteger(interval)){
				msg.reply("interval must be an integer")
				return
			}
		} 
		if (flags[4] != undefined) {
			times = parseInt(flags[4]);
			if(!Number.isInteger(times)){
				msg.reply("times must be an integer")
				return
			}
		}

		if(times > 200){
			msg.reply("too many times")
			return
		}
		
		let postMsg = ""
		let r = true
		rep = setInterval(async (e) => {
			if (times <= 0) {
				clearInterval(rep);
				// utry(()=>{msg.reply("ok done")});
				return;
			}
			times--;
			if(msg.content.split(";").length > 1){
				let x = msg.content.split(";")[1];
				console.log(x)
				if(x == " prev" || x == "prev"){
					console.log("made it")
					await msg.channel.messages.fetch({limit: 2}).then(res => {
						if(r) {
							postMsg = res.last().content
							r = false
						}
					})
				} else{
					postMsg = x
				}
			}
			utry(()=> {
				if(cmd === 'dm'){
					let dmid = person.substring(2, person.length - 2)
					console.log(dmid)
					utry(()=>{
						msg.mentions.users.first().send(postMsg)
					})
				} else{
					utry(() => {
						msg.channel.send(`${person} ${postMsg}`)
					})
				}
			});
		}, interval * 1000);
	}

	// ,stop
	if (cmd === 'stop') {
		try {
			clearInterval(rep);
			msg.reply("ok done");
		} catch (e) {
			msg.reply("error");
		}
	}

	// ,help
	if (cmd === 'help') {
		msg.reply(",ping <user> every <interval> seconds <times> times; <message>\n,dm <user> every <interval> seconds <times> times; <message>\n,stop\n,help\n")
	}

	// ,wiggle <user>
	if (cmd === 'wiggle') {
		let m = 20
		let a = 0.21
		let p = 0.75 * Math.PI

		let person = flags[0]
		if(person.substring(2, person.length - 1) == me && msg.author.id != me) {
			msg.reply("haha u dumb fuck")
			return
		}

		let r = true
		let times = 50
		rep = setInterval(async (e) => {
			if (times <= 0) {
				clearInterval(rep);
				return;
			}
			s = m * Math.sin((50 - times) * a + p) + m
			s = Math.round(s)
			dots = " . ".repeat(s)
			times--
			utry(() => {
				msg.channel.send(`${dots} ${person}`)
			});
		}, 250);
	}
})


client.login(token);
