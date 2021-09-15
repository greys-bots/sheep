const { Client, Intents } = require("discord.js");
const fs				  = require("fs");
const path 				  = require("path");
const dblite			  = require("dblite");

const bot = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
		Intents.FLAGS.DIRECT_MESSAGES,
		Intents.FLAGS.DIRECT_MESSAGE_REACTIONS
	],
	partials: [
		'MESSAGE',
		'USER',
		'CHANNEL',
		'GUILD_MEMBER',
		'REACTION'
	],
	messageCacheMaxSize: 0,
	messageCacheLifetime: 1,
	messageSweepInterval: 1
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
		var guilds = (await bot.shard.broadcastEval(cli => cli.guilds.cache.size)).reduce((prev, val) => prev + val, 0);
		return `s!h | in ${guilds} guilds!`;
	},
	"s!h | https://sheep.greysdawn.com"
];

bot.updateStatus = async function(){
	//wait for all guilds to show up before setting the status again
	if(bot.status == -1) {
		var guilds = (await bot.shard.broadcastEval(cli => cli.guilds.cache.size)).reduce((prev, val) => prev + val, 0);
		if(guilds != bot.guildCount) {
			bot.guildCount = guilds;
			setTimeout(()=> bot.updateStatus(), 10000);
		} else {
			bot.status = 0;
			bot.updateStatus();
		}
		return;
	}
	var target = bot.statuses[bot.status % bot.statuses.length];
	if(typeof target == "function") {
		console.log(target());
		bot.user.setActivity(await target());
	} else bot.user.setActivity(target);
	bot.status++;
		
	setTimeout(()=> bot.updateStatus(), 600000)
}

async function setup() {
	bot.db = require('./stores/__db')(bot);

	files = fs.readdirSync("./events");
	files.forEach(f => bot.on(f.slice(0,-3), (...args) => require("./events/"+f)(...args,bot)));

	bot.handlers = {};
	files = fs.readdirSync(__dirname + "/handlers");
	files.forEach(f => bot.handlers[f.slice(0,-3)] = require(__dirname + "/handlers/"+f)(bot));

	bot.utils = {};
	files = fs.readdirSync("./utils");
	files.forEach(f => Object.assign(bot.utils, require("./utils/"+f)));
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
		await bot.shard.broadcastEval(cli => cli.updateStatus());
})

bot.on('error', (err)=> {
	console.log(`Error:\n${err.stack}`);
	bot.writeLog(`=====ERROR=====\r\nStack: ${err.stack}`)
})

process.on("unhandledRejection", (e) => console.log(/*e.message ||*/ e));

setup();
bot.login(process.env.TOKEN)
.catch(e => console.log("Trouble connecting...\n"+e));
