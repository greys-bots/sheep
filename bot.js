const Discord 	= require("discord.js");
const fs 		= require("fs");
const dblite 	= require("dblite");

require ('dotenv').config();

const bot = new Discord.Client({partials: ['MESSAGE', 'USER', 'CHANNEL', 'GUILD_MEMBER']});

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
			bot.user.setActivity("s!h | in "+bot.guilds.size+" guilds!");
			bot.status++;
			break;
		case 1:
			bot.user.setActivity("s!h | serving "+bot.users.size+" users!");
			bot.status++;
			break;
		case 2:
			bot.user.setActivity("s!h | website: sheep.greysdawn.com");
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
				return "Command not found.";
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

		return {embed: embed};
	},
	alias: ["h", "halp", "?"]
}

async function setup() {
	var files = fs.readdirSync("./commands");
	files.forEach(f => bot.commands[f.slice(0,-3)] = require("./commands/"+f));

	files = fs.readdirSync("./events");
	files.forEach(f => bot.on(f.slice(0,-3), (...args) => require("./events/"+f)(...args,bot)));

	bot.db.query(`CREATE TABLE IF NOT EXISTS configs (
		id 			INTEGER PRIMARY KEY AUTOINCREMENT,
		server_id 	TEXT,
		role_mode 	INTEGER,
		disabled 	TEXT,
		pingable 	INTEGER
	)`);

	bot.db.query(`CREATE TABLE IF NOT EXISTS colors (
		id 			INTEGER PRIMARY KEY AUTOINCREMENT,
		server_id 	TEXT,
		role_id 	TEXT,
		user_id 	TEXT,
		type 		INTEGER
	)`)
}

bot.writeLog = async (log) => {
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
	bot.writeLog('=====LOG START=====')
	updateStatus();
})

bot.on('error', (err)=> {
	console.log(`Error:\n${err.stack}`);
	bot.writeLog(`=====ERROR=====\r\nStack: ${err.stack}`)
})

setup();
bot.login(process.env.TOKEN)
.catch(e => console.log("Trouble connecting...\n"+e));