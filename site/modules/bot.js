const Discord	= require("discord.js");
const bot 		= new Discord.Client({
	partials: ['MESSAGE', 'USER', 'CHANNEL', 'GUILD_MEMBER', 'REACTION']
});

bot.on("ready", async ()=> {
	console.log(`Shard ${bot.shard.ids.join(", ")} ready!`);
	bot.shard.send('READY');
});

bot.login(process.env.TOKEN)