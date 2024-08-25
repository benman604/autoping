const { Client } = require('discord.js');
const { token, me, sid, justin, nomic, testsite } = require('./config.json');
const client = new Client({ intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_VOICE_STATES"] });
const fs = require('fs');
const annoying = require('./annoying.js');
const showCounterProbability = 0.2;
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

function isPingable(msg) {
	const mentions = msg.mentions.users.map(user => user.id)
	for (let mention of mentions) {
		if (fs.existsSync('noping/' + mention)) {
			return false
		}
	}
	return true
}

client.on('messageCreate', (msg) => {
	// if(msg.author.bot) return;

	let isAnnoying = false
	annoying.some(exp => {
		if (exp.test(msg.content.toLowerCase())) {
			isAnnoying = true
		}
	})

	if (isAnnoying) {
		let count = 0;
		if (!fs.existsSync('annoying/' + msg.author.id)) {
			fs.appendFile('annoying/' + msg.author.id, '', (err) => {
				if (err) {
					console.log(err)
				}
			})
		} else {
			let contents = fs.readFileSync('annoying/' + msg.author.id, 'utf8')
			count = parseInt(contents)
		}
		count++

		if (Math.random() < showCounterProbability) {
			let nickname = msg.member.displayName
			if (nickname == null) {
				nickname = msg.author.username
			}
			msg.reply(`${msg.member.displayName} please shut the fuck up i've told you ${count} times`)
		} else {
			msg.reply('shut the FUCK up')
		}

		fs.writeFileSync('annoying/' + msg.author.id, String(count))
	}

	if(!msg.content.startsWith(',')) return;
	
	let flags = msg.content.split(" ");
	flags.shift()
	let cmd = msg.content.split(" ")[0].substring(1);
	
	// ,ping 0<User> every 2<Float> seconds 4<Int> times
	// ,dm
	if (cmd === 'ping' || cmd === 'dm') {
		if (isPingable(msg)) {
			let person = flags[0];
			let interval = 2;
			let times = 10;
			
			// if(person.substring(2, person.length - 1) == me && msg.author.id != me) {
			// 	msg.reply("haha u dumb fuck")
			// 	return
			// }
			// if(person.substring(2, person.length - 1) == sid && msg.author.id != sid && msg.author.id != me){
			// 	msg.reply("no sorry lets not make him angry")
			// 	return
			// }

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
			}, interval * 1000)
		} else {
			msg.reply("user opted out of pings")
		}
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
		msg.reply("Autoping\n© Benjamin Man 2023\n\n,ping <user> every <interval> seconds <times> times; <message>\n,dm <user> every <interval> seconds <times> times; <message>\n,wiggle <user> <message>\n,onvc\n,noping\n,status\n,help\n")
	}

	// ,wiggle <user>
	if (cmd === 'wiggle') {
		let m = 20
		let a = 0.21
		let p = 0.75 * Math.PI

		// let person = flags[0]
		// if(person.substring(2, person.length - 1) == me && msg.author.id != me) {
		// 	msg.reply("haha u dumb fuck")
		// 	return
		// }

		// console.log(flags.join(' '))

		if (isPingable(msg)) {
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
					msg.channel.send(`${dots} ${flags.join(' ')}`)
				})
			}, 250)
		} else {
			msg.reply("user opted out of pings")
		}
	}

	// ,noping
	if (cmd === 'noping') {
		if (fs.existsSync('noping/' + msg.author.id)) {
			fs.unlinkSync('noping/' + msg.author.id)
			msg.reply("you've opted back in to autopings. to opt out, type ,noping again.")
		} else {
			fs.appendFile('noping/' + msg.author.id, 'USR-OPT-OUT-ID-' + msg.author.id, (err) => {
				if (err) throw err;
				msg.reply("you've opted out of autopings. to opt back in, type ,noping again.")
			})
		}
	}

	if (cmd === 'onvc') {
		if (fs.existsSync('onvc/' + msg.author.id)) {
			fs.unlinkSync('onvc/' + msg.author.id)
			msg.reply("you've been removed from pingonvc. to be added, type ,onvc again.")
		} else {
			fs.appendFile('onvc/' + msg.author.id, 'USR-OPT-IN-ID-' + msg.author.id, (err) => {
				if (err) throw err;
				msg.reply("you've been added to pingonvc. to be removed, type ,onvc again.")
			})
		}
	}

	if(cmd === 'status') {
		let rpl = `you're${(fs.existsSync('onvc/' + msg.author.id)) ? '' : ' not'} in pingonvc.\n`
		rpl +=    `you're${(fs.existsSync('noping/' + msg.author.id)) ? '' : ' not'} opted out of autopings`
		msg.reply(rpl)
	}
})

client.on('voiceStateUpdate', (oldState, newState) => {
    return
	if (newState.channelId !== null && newState.channel.members.size === 1 && oldState.channelId === null) {
		console.log("ok")
		client.channels.fetch(nomic).then(channel => {
			let pings = ",wiggle "

			fs.readdir('onvc/', (err, usrs) => {
				if (usrs.length > 0) {
					for (let usr of usrs) {
						pings += `<@${usr}> `
					}
					channel.send(pings + " HOP ON VC")
				}
			})
		})
	}
})

client.login(token);
