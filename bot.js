const {
	Client,
	GatewayIntentBits: Intents,
	Partials,
	Options
} = require("discord.js");
const {
	FrameClient,
	Utilities,
	Handlers
} = require('frame');
const fs = require("fs");
const path = require("path");

const bot = new FrameClient({
	intents: [
		Intents.Guilds,
		Intents.GuildMessages,
		Intents.GuildMessageReactions,
		Intents.GuildMembers,
		Intents.DirectMessages,
		Intents.DirectMessageReactions
	],
	partials: [
		Partials.Message,
		Partials.User,
		Partials.Channel,
		Partials.GuildMember,
		Partials.Reaction
	],
	makeCache: Options.cacheWithLimits({
		MessageManager: 0,
		ThreadManager: 0
	})
}, {
	prefix: process.env.PREFIX ? [process.env.PREFIX] : ["s!","sh!","sheep!","baa!"],
	owner: process.env.OWNER,
	statuses: [
		async ()=> {
			var guilds = (await bot.shard.broadcastEval(cli => cli.guilds.cache.size)).reduce((prev, val) => prev + val, 0);
			return `/help | in ${guilds} guilds!`;
		},
		"/help | https://sheep.greysdawn.com"
	]
});

bot.tc = require('tinycolor2');
bot.jimp = require('jimp');
bot.fetch = require('axios');

async function setup() {
	var { db, stores } = await Handlers.DatabaseHandler(bot, __dirname + '/stores');
	bot.db = db;
	bot.stores = stores;

	files = fs.readdirSync(__dirname + "/events");
	files.forEach(f => bot.on(f.slice(0,-3), (...args) => require(__dirname + "/events/"+f)(...args,bot)));

	bot.handlers = {};
	bot.handlers.interaction = Handlers.InteractionHandler(bot, __dirname + '/commands');

	bot.utils = Utilities;
	files = fs.readdirSync("./utils");
	files.forEach(f => Object.assign(bot.utils, require("./utils/"+f)));
}

bot.on("ready", async ()=> {
	console.log(`Logged in as ${bot.user.tag} (${bot.user.id})`);
	bot.user.setActivity("/help | booting...");
})

bot.on('error', (err)=> {
	console.log(`Error:\n${err.stack}`);
})

process.on("unhandledRejection", (e) => console.log(/*e.message ||*/ e));

process.on(`SIGTERM`, ()=> {
    try {
        bot.db?.end();
    } catch(e) {
        console.log(e.message);
    }
    process.exit();
})

process.on(`SIGINT`, ()=> {
    try {
        bot.db?.end();
    } catch(e) {
        console.log(e.message);
    }
    process.exit();
})

setup();
bot.login(process.env.TOKEN)
.catch(e => console.log("Trouble connecting...\n"+e));
