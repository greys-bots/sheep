const Discord		= require("discord.js");
const fs			= require("fs");
const path 			= require("path");

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

bot.status = 0;
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
	var target = bot.statuses[bot.status % bot.statuses.length];
	if(typeof target == "function") bot.user.setActivity(await target());
	else bot.user.setActivity(target);
	bot.status++;
		
	setTimeout(()=> bot.updateStatus(), 5 * 60 * 1000) // 5 mins
}

async function setup() {
	bot.db = require(__dirname + '/../common/stores/__db')(bot);

	files = fs.readdirSync(__dirname + "/events");
	files.forEach(f => bot.on(f.slice(0,-3), (...args) => require(__dirname + "/events/"+f)(...args,bot)));

	bot.utils = {};
	files = fs.readdirSync(__dirname + "/utils");
	files.forEach(f => Object.assign(bot.utils, require(__dirname + "/utils/"+f)));

	Object.assign(bot.utils, require(__dirname + "/../common/utils"));

	var data = bot.utils.loadCommands(__dirname + "/../common/commands");
	
	Object.keys(data).forEach(k => bot[k] = data[k]);
}

bot.parseCommand = async function(bot, msg, args) {
	if(!args[0]) return undefined;
	
	var command = bot.commands.get(bot.aliases.get(args[0].toLowerCase()));
	if(!command) return {command, nargs: args};

	args.shift();

	if(args[0] && command.subcommands?.get(command.sub_aliases.get(args[0].toLowerCase()))) {
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

bot.on("ready", async ()=> {
	console.log(`Shard ${bot.shard.ids.join(", ")} ready!`);
	bot.writeLog('=====LOG START=====')
	await bot.user.setActivity("s!h | booting...");
	bot.shard.send('READY');
})

bot.on('error', (err)=> {
	console.log(`Error:\n${err.stack}`);
	bot.writeLog(`=====ERROR=====\r\nStack: ${err.stack}`)
})

process.on("unhandledRejection", (e) => console.log(e.message || e));

setup();
bot.login(process.env.TOKEN)
.catch(e => console.log("Trouble connecting...\n"+e));