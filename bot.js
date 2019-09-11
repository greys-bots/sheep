const Eris 		= require("eris-additions")(require("eris"));
const fs 		= require("fs");
const dblite 	= require("dblite");

require ('dotenv').config();

const bot = new Eris(process.env.TOKEN);

bot.commands = {};

bot.prefix = ["s!","sh!","sheep!","baa!"];

bot.utils = require('./utils');

bot.tc = require('tinycolor2');
bot.jimp = require('jimp');

bot.db = dblite("./data.sqlite","-header");

bot.status = 0;

const updateStatus = function(){
	switch(bot.status){
		case 0:
			bot.editStatus({name: "s!h | in "+bot.guilds.size+" guilds!"});
			bot.status++;
			break;
		case 1:
			bot.editStatus({name: "s!h | serving "+bot.users.size+" users!"});
			bot.status++;
			break;
		case 2:
			bot.editStatus({name: "s!h | website: sheep.greysdawn.com"});
			bot.status = 0;
			break;
	}

	setTimeout(()=> updateStatus(),600000)
}

bot.commands.help = {
	help: ()=> "Displays help embed.",
	usage: ()=> [" - Displays help for all commands.",
				" [command] - Displays help for specfic command.",
				" [command] [subcommand]... - Displays help for a command's subcommands"],
	execute: async (bot, msg, args) => {
		let cmd;
		let names;
		let embed;
		if(args[0]) {
			let dat = await bot.parseCommand(bot, msg, args);
			if(dat) {
				cmd = dat[0];
				names = dat[2].split(" ");
				embed = {
					title: `Help | ${names.join(" - ").toLowerCase()}`,
					description: [
						`${cmd.help()}\n\n`,
						`**Usage**\n${cmd.usage().map(c => `${bot.prefix[0] + names.join(" ")}${c}`).join("\n")}\n\n`,
						`**Aliases:** ${cmd.alias ? cmd.alias.join(", ") : "(none)"}\n\n`,
						`**Subcommands**\n${cmd.subcommands ?
							Object.keys(cmd.subcommands).map(sc => `**${bot.prefix[0]}${names.join(" ")} ${sc}** - ${cmd.subcommands[sc].help()}`).join("\n") +"\n\n" : 
							"(none)\n\n"}`,
							cmd.desc ? "**Extra**\n"+cmd.desc() : ""
					].join(""),
					footer: {
						icon_url: bot.user.avatarURL,
						text: "Arguments like [this] are required, arguments like <this> are optional."
					}
				}
			} else {
				msg.channel.createMessage("Command not found.")
			}
		} else {
			embed = {
				title: `Sheep - help`,
				description:
					`Hello, I am a sheep baaaah-t! I'll help you change your colors!\n**My current prefixes are:** ${bot.prefix.join(", ")}\nUse *`+'`s!help command`'+`* for command-specific help\n\n`+
					`**Commands**\n${Object.keys(bot.commands)
									.map(c => `**${bot.prefix[0] + c}** - ${bot.commands[c].help()}`)
									.join("\n")}\n\n`,
				footer: {
					icon_url: bot.user.avatarURL,
					text: "Arguments like [this] are required, arguments like <this> are optional."
				}
			}
		}

		msg.channel.createMessage({embed: embed});
	},
	alias: ["h", "halp", "?"]
}

async function setup() {
	var files = fs.readdirSync("./commands");
	await Promise.all(files.map(f => {
		bot.commands[f.slice(0,-3)] = require("./commands/"+f);
		return new Promise((res,rej)=>{
			setTimeout(res("a"),100)
		})
	})).then(()=> console.log("finished loading commands."));

	bot.db.query(`CREATE TABLE IF NOT EXISTS configs (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		server_id TEXT UNIQUE,
		role_mode INTEGER
	)`);

	bot.db.query(`CREATE TABLE IF NOT EXISTS colors (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		server_id TEXT,
		role_id TEXT UNIQUE,
		user_id TEXT,
		type INTEGER
	)`)
}

async function writeLog(log) {
	let now = new Date();
	let ndt = `${(now.getMonth() + 1).toString().length < 2 ? "0"+ (now.getMonth() + 1) : now.getMonth()+1}.${now.getDate().toString().length < 2 ? "0"+ now.getDate() : now.getDate()}.${now.getFullYear()}`;
	if(!fs.existsSync(`./logs/${ndt}.log`)){
		fs.writeFile(`./logs/${ndt}.log`,log+"\r\n",(err)=>{
			if(err) console.log(`Error while attempting to write log ${ndt}\n`+err.stack);
		});
	} else {
		fs.appendFile(`./logs/${ndt}.log`,log+"\r\n",(err)=>{
			if(err) console.log(`Error while attempting to apend to log ${ndt}\n`+err);
		});
	}
}

bot.parseCommand = async function(bot, msg, args, command) {
	return new Promise(async (res,rej)=>{
		var commands;
		var cmd;
		var name = "";
		if(command) {
			commands = command.subcommands || [];
		} else {
			commands = bot.commands;
		}

		if(args[0] && commands[args[0].toLowerCase()]) {
			cmd = commands[args[0].toLowerCase()];
			name = args[0].toLowerCase();
			args = args.slice(1);
		} else if(args[0] && Object.values(commands).find(cm => cm.alias && cm.alias.includes(args[0].toLowerCase()))) {
			cmd = Object.values(commands).find(cm => cm.alias && cm.alias.includes(args[0].toLowerCase()));
			name = args[0].toLowerCase();
			args = args.slice(1);
		} else if(!cmd) {
			res(undefined);
		}

		if(cmd && cmd.subcommands && args[0]) {
			let data = await bot.parseCommand(bot, msg, args, cmd);
			if(data) {
				cmd = data[0]; args = data[1];
				name += " "+data[2];
			}
		}

		res([cmd, args, name]);
	})
	
}

bot.on("ready", ()=> {
	console.log('Ready!');
	writeLog('=====LOG START=====')
	updateStatus();
})

bot.on("messageCreate",async (msg)=>{
	if(msg.author.bot) return;
	if(!new RegExp(`^(${bot.prefix.join("|")})`,"i").test(msg.content.toLowerCase())) return;
	var log = [
			`Guild: ${msg.guild.name} (${msg.guild.id})`,
			`User: ${msg.author.username}#${msg.author.discriminator} (${msg.author.id})`,
			`Message: ${msg.content}`,
			`--------------------`
		];
	let args = msg.content.replace(new RegExp(`^(${bot.prefix.join("|")})`,"i"), "").split(" ");
	if(!args[0]) args.shift();
	if(!args[0]) return msg.channel.createMessage("Baaa!");
	var config;
	if(msg.guild) config = await bot.utils.getConfig(bot, msg.guild.id);
	else config = undefined;
	let cmd = await bot.parseCommand(bot, msg, args);
	if(cmd) {
		var check = await bot.utils.checkPermissions(bot, msg, cmd);
		if(check) {
			var res;
			try {
				var res = await cmd[0].execute(bot, msg, cmd[1], config);
			} catch(e) {
				console.log(e.stack);
				log.push(`Error: ${e.stack}`);
				log.push(`--------------------`);
				msg.channel.createMessage('There was an error! D:')
			}
			if(res) {
				msg.channel.createMessage(res);
			}
		}
		else {
			msg.channel.createMessage('You do not have permission to use that command.');
			log.push('- Missing Permissions -')
		}
	}
	else {
		msg.channel.createMessage("Command not found.");
		log.push('- Command Not Found -')
	}
	console.log(log.join('\r\n'));
	writeLog(log.join('\r\n'))
});

bot.on("messageReactionAdd", async (msg, emoji, user)=> {
	if(bot.user.id == user) return;
	if(bot.posts && bot.posts[msg.id] && bot.posts[msg.id].user == user) {
		switch(emoji.name) {
			case '\u2705':
				var position;
				var role;
				var color = bot.posts[msg.id].data.toHex() == "000000" ? "000001" : bot.posts[msg.id].data.toHex();
				try {
					position = msg.guild.roles.find(r => r.name.toLowerCase() == "sheep" && msg.guild.members.find(m => m.id == bot.user.id).roles.includes(r.id)).position;
				} catch(e) {
					position = undefined;
					console.log("Couldn't get role position");
					writeLog(e.stack);
				}
				try {
					role = await bot.utils.getUserRole(bot, msg.channel.guild, user);
					if(!role) role = await bot.createRole(msg.channel.guild.id, {name: user, color: parseInt(color,16)});
					else role = await bot.editRole(msg.channel.guild.id, role, {color: parseInt(color, 16)});
					await bot.addGuildMemberRole(msg.channel.guild.id, user, role.id);
					if(position) await bot.editRolePosition(msg.channel.guild.id, role.id, position-1);
					await bot.editMessage(msg.channel.id, msg.id, {content: "Color successfully changed to #"+color+"! :D", embed: {}});
					await bot.removeMessageReactions(msg.channel.id, msg.id);
					delete bot.posts[msg.id];
				} catch(e) {
					console.log(e.stack);
					writeLog(e.stack);
					var err = "";
					if(e.stack.includes('Client.editRolePosition')) {
						err = "Can't edit role position! Make sure I have the `manageRoles` permission";
					} else if(e.stack.includes('Client.editRole')) {
						err = "Can't edit role! Make sure I have the `manageRoles` permission";
					} else if(e.stack.includes('Client.removeMessageReactions')) {
						err = "Can't remove reactions! Make sure I have the `manageMessages` permission";
					}
					msg.channel.createMessage("Something went wrong! ERR: "+err);
				}
				break;
			case '\u274C':
				bot.editMessage(msg.channel.id, msg.id, {content: "Action cancelled", embed: {}});
				bot.removeMessageReactions(msg.channel.id, msg.id);
				delete bot.posts[msg.id];
				break
			case '🔀':
				var color = bot.tc(Math.floor(Math.random()*16777215).toString(16));
				bot.editMessage(msg.channel.id, msg.id, {embed: {
					title: "Color "+color.toHexString().toUpperCase(),
					image: {
						url: `https://sheep.greysdawn.com/sheep/${color.toHex()}`
					},
					color: parseInt(color.toHex(), 16)
				}})
				clearTimeout(bot.posts[msg.id].timeout)
				bot.posts[msg.id] = {
					user: bot.posts[msg.id].user,
					data: color,
					timeout: setTimeout(()=> {
						if(!bot.posts[msg.id]) return;
						message.removeReactions()
						delete bot.posts[message.id];
					}, 900000)
				};
				break;
		}
	}
})

bot.on("guildMemberRemove", async (guild, member)=> {
	var role = guild.roles.find(r => r.name == member.id);
	if(!role) return;
	bot.deleteRole(guild.id, role.id, "Member left server");
})

bot.on('error',(err,id)=> {
	console.log(`Error on shard ${id}:\n${err.stack}`);
	writeLog(`ERR:\r\nShard: ${id}\r\nStack: ${err.stack}`)
})

setup();
bot.connect()
.catch(e => console.log("Trouble connecting...\n"+e));