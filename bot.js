const Discord		= require("discord.js");
const fs			= require("fs");
const path 			= require("path");
const dblite		= require("dblite");

const bot = new Discord.Client({
	partials: ['MESSAGE', 'USER', 'CHANNEL', 'GUILD_MEMBER', 'REACTION'],
	messageCacheMaxSize: 0,
	messageCacheLifetime: 1,
	messageSweepInterval: 5 * 60
});

bot.prefix = ["s!","sh!","sheep!","baa!"];
bot.owner = process.env.OWNER;

bot.tc = require('tinycolor2');
bot.jimp = require('jimp');
bot.fetch = require('axios');

bot.status = -1;
bot.guildCount = 0;
bot.statuses = [
	async ()=> {
		var guilds = (await bot.shard.broadcastEval('this.guilds.cache.size')).reduce((prev, val) => prev + val, 0);
		return `s!h | in ${guilds} guilds!`;
	},
	async ()=> {
		var users = (await bot.shard.broadcastEval('this.users.cache.size')).reduce((prev, val) => prev + val, 0);
		return `s!h | serving ${users} users!`;
	},
	"s!h | https://sheep.greysdawn.com"
];

bot.updateStatus = async function(){
	//wait for all guilds to show up before setting the status again
	if(bot.status == -1) {
		var guilds = (await bot.shard.broadcastEval('this.guilds.cache.size')).reduce((prev, val) => prev + val, 0);
		if(guilds != bot.guildCount) {
			console.log("updating guilds...", guilds);
			bot.guildCount = guilds;
			setTimeout(()=> bot.updateStatus(), 10000);
		} else {
			bot.status = 0;
			bot.updateStatus();
		}
		return;
	}
	var target = bot.statuses[bot.status % bot.statuses.length];
	console.log(target);
	if(typeof target == "function") {
		console.log(target());
		bot.user.setActivity(await target());
	} else bot.user.setActivity(target);
	bot.status++;
		
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

//for handling commands
const registerCommand = function({command, module, name} = {}) {
	if(!command) return;
	command.module = module;
	command.name = name;
	module.commands.set(name, command);
	bot.commands.set(name, command);
	bot.aliases.set(name, name);
	if(command.alias) command.alias.forEach(a => bot.aliases.set(a, name));
	
	if(command.subcommands) {
		var subcommands = command.subcommands;
		command.subcommands = new Discord.Collection();
		Object.keys(subcommands).forEach(c => {
			var cmd = subcommands[c];
			cmd.name = `${command.name} ${c}`;
			cmd.parent = command;
			cmd.module = command.module;
			if(!command.sub_aliases) command.sub_aliases = new Discord.Collection();
			command.sub_aliases.set(c, c);
			if(cmd.alias) cmd.alias.forEach(a => command.sub_aliases.set(a, c));
			if(command.permissions && !cmd.permissions) cmd.permissions = command.permissions;
			if(command.guildOnly != undefined && cmd.guildOnly == undefined)
				cmd.guildOnly = command.guildOnly;
			command.subcommands.set(c, cmd);
		})
	}
	return command;
}

async function setup() {
	bot.db = require('./stores/__db')(bot);

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
		var path_frags = f.replace("./commands/","").split(/(?:\\|\/)/);
		var mod = path_frags.length > 1 ? path_frags[path_frags.length - 2] : "Unsorted";
		var file = path_frags[path_frags.length - 1];
		if(!bot.modules.get(mod.toLowerCase())) {
			var mod_info = require(file == "__mod.js" ? f : f.replace(file, "__mod.js"));
			bot.modules.set(mod.toLowerCase(), {...mod_info, name: mod, commands: new Discord.Collection()})
			bot.mod_aliases.set(mod.toLowerCase(), mod.toLowerCase());
			if(mod_info.alias) mod_info.alias.forEach(a => bot.mod_aliases.set(a, mod.toLowerCase()));
		}
		if(file == "__mod.js") continue;

		mod = bot.modules.get(mod.toLowerCase());
		if(!mod) {
			console.log("Whoopsies");
			continue;
		}
		
		registerCommand({command: require(f), module: mod, name: file.slice(0, -3).toLowerCase()})
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
	if(!fs.existsSync(`./logs`)) fs.mkdirSync('./logs');
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

bot.on("ready", async ()=> {
	console.log('Ready!');
	bot.writeLog('=====LOG START=====')
	await bot.user.setActivity("s!h | booting...");
	if(bot.shard.ids.find(id => id+1 == bot.shard.count))
		await bot.shard.broadcastEval('this.updateStatus()');
})

bot.on('error', (err)=> {
	console.log(`Error:\n${err.stack}`);
	bot.writeLog(`=====ERROR=====\r\nStack: ${err.stack}`)
})

process.on("unhandledRejection", (e) => console.log(/*e.message ||*/ e));

setup();
bot.login(process.env.TOKEN)
.catch(e => console.log("Trouble connecting...\n"+e));