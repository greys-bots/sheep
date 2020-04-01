const Discord		= require("discord.js");
const fs			= require("fs");
const path 			= require("path");
const dblite		= require("dblite");

const bot = new Discord.Client({partials: ['MESSAGE', 'USER', 'CHANNEL', 'GUILD_MEMBER']});

bot.prefix = ["s!","sh!","sheep!","baa!"];
bot.owner = process.env.OWNER;

bot.tc = require('tinycolor2');
bot.jimp = require('jimp');
bot.fetch = require('axios');

bot.db = dblite("./data.sqlite","-header");

bot.status = 0;

bot.updateStatus = async function(){
	switch(bot.status){
		case 0:
			try {
				var guilds = (await bot.shard.fetchClientValues('guilds.cache.size')).reduce((prev, val) => prev + val, 0)
			} catch(e) {
				console.log("Couldn't get guilds size: "+err.message);
			}
			bot.user.setActivity("s!h | in "+guilds+" guilds!");
			bot.status++;
			break;
		case 1:
			try {
				var users = (await bot.shard.fetchClientValues('users.cache.size')).reduce((prev, val) => prev + val, 0)
			} catch(e) {
				console.log("Couldn't get users size: "+err.message);
			}
			bot.user.setActivity("s!h | serving "+users+" users!");
			bot.status++;
			break;
		case 2:
			bot.user.setActivity("s!h | website: sheep.greysdawn.com");
			bot.status = 0;
			break;
	}

	setTimeout(()=> bot.updateStatus(), 600000)
}

const recursivelyReadDirectory = function(dir) {
	var results = [];
	var files = fs.readdirSync(dir, {withFileTypes: true});
	for(file of files) {
		if(file.isDirectory()) {
			results = results.concat(recursivelyReadDirectory(dir+"/"+file.name));
		} else {
			results.push(dir+"/"+file.name);
		}
	}

	return results;
}

async function setup() {
	bot.db.query(`CREATE TABLE IF NOT EXISTS colors (
		id 			INTEGER PRIMARY KEY AUTOINCREMENT,
		user_id 	TEXT,
		name 		TEXT,
		color 		TEXT
	)`);

	bot.db.query(`CREATE TABLE IF NOT EXISTS configs (
		id 			INTEGER PRIMARY KEY AUTOINCREMENT,
		server_id 	TEXT,
		role_mode 	INTEGER,
		disabled 	TEXT,
		pingable 	INTEGER
	)`);

	bot.db.query(`CREATE TABLE IF NOT EXISTS roles (
		id 			INTEGER PRIMARY KEY AUTOINCREMENT,
		server_id 	TEXT,
		role_id 	TEXT,
		user_id 	TEXT,
		type 		INTEGER
	)`);

	files = fs.readdirSync("./events");
	files.forEach(f => bot.on(f.slice(0,-3), (...args) => require("./events/"+f)(...args,bot)));

	bot.utils = {};
	files = fs.readdirSync("./utils");
	files.forEach(f => Object.assign(bot.utils, require("./utils/"+f)));

	files = recursivelyReadDirectory("./commands");

	bot.modules = new Discord.Collection();
	bot.mod_aliases = new Discord.Collection();
	bot.commands = new Discord.Collection();
	bot.aliases = new Discord.Collection();
	for(f of files) {
		var path_frags = f.split(/(?:\\|\/)/);
		var mod = path_frags[path_frags.length - 2];
		var file = path_frags[path_frags.length - 1];
		if(!bot.modules.get(mod.toLowerCase())) {
			var mod_info = require(file == "__mod.js" ? f : f.replace(file, "__mod.js"));
			bot.modules.set(mod.toLowerCase(), {...mod_info, name: mod, commands: new Discord.Collection()});
			bot.mod_aliases.set(mod.toLowerCase(), mod.toLowerCase());
			if(mod_info.alias) mod_info.alias.forEach(a => bot.mod_aliases.set(a, mod.toLowerCase()));
		}
		if(file == "__mod.js") continue;

		mod = bot.modules.get(mod.toLowerCase());
		if(!mod) {
			console.log("??? Something went wrong I guess");
			continue;
		}

		var command = require(f);
		command.module = mod;
		command.name = file.slice(0, -3).toLowerCase();
		mod.commands.set(file.slice(0,-3).toLowerCase(), command);
		bot.commands.set(file.slice(0, -3).toLowerCase(), command);
		bot.aliases.set(command.name, command.name);
		if(command.alias) {
			command.alias.forEach(a => bot.aliases.set(a, command.name));
		}
		if(command.subcommands) {
			var subcommands = command.subcommands;
			command.subcommands = new Discord.Collection();
			Object.keys(subcommands).forEach(c => {
				var cmd = subcommands[c];
				cmd.name = `${command.name} ${c}`;
				cmd.parent = command;
				cmd.module = command.module;
				if(cmd.alias) {
					if(!command.sub_aliases) command.sub_aliases = new Discord.Collection();
					command.sub_aliases.set(c, c);
					cmd.alias.forEach(a => command.sub_aliases.set(a, c));
				}
				command.subcommands.set(c, cmd);
			})
		}
	}
}

bot.parseCommand = async function(bot, msg, args) {
	if(!args[0]) return undefined;
	
	var command = bot.commands.get(bot.aliases.get(args[0].toLowerCase()));
	if(!command) return {command, nargs: args};

	args.shift();

	if(args[0] && command.subcommands && command.subcommands.get(command.sub_aliases.get(args[0].toLowerCase()))) {
		command = command.subcommands.get(command.sub_aliases.get(args[0].toLowerCase()));
		args.shift();
	}

	return {command, nargs: args};
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

bot.on("ready", ()=> {
	console.log('Ready!');
	bot.writeLog('=====LOG START=====')
	bot.updateStatus();
})

bot.on('error', (err)=> {
	console.log(`Error:\n${err.stack}`);
	bot.writeLog(`=====ERROR=====\r\nStack: ${err.stack}`)
})

setup();
bot.login(process.env.TOKEN)
.catch(e => console.log("Trouble connecting...\n"+e));