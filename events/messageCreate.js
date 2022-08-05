const WELCOMES = [
	"you're welcome!",
	"you're welcome! :D",
	"of course!",
	"no problem!",
	"don't mention it :heart:",
	"baa!! :heart:"
];

module.exports = async (msg, bot)=>{
	if(msg.author.bot) return;
	if(msg.content == "s!debug") {
		console.log(
			`Shard: ${bot.shard.ids}\r\n`,
			`Commands:\r\n`,
			bot.commands,
			'\r\n',
			`App commands:\r\n`,
			bot.slashCommands
		)
	}
	var prefix; 
	var match;
	if(process.env.REQUIRE_MENTIONS) {
		if(msg.content.match(new RegExp(`^(${bot.prefix.join("|")})`,"i")))
			return 'Baaa! Please ping me to use commands!';
		prefix = new RegExp(`^<@!?(?:${bot.user.id})>`);
		match = msg.content.match(prefix);
	} else {
		prefix = new RegExp(`^(${bot.prefix.join("|")})`,"i");
		match = prefix.test(msg.content.toLowerCase());
	}
	if(!match) {
		var thanks = msg.content.match(/^(thanks? ?(you)?|ty),? ?sheep/i);
		if(thanks) return await msg.channel.send(WELCOMES[Math.floor(Math.random() * WELCOMES.length)]);
		return;
	}

	var content = msg.content.replace(prefix, '').trim();
	if(content.length == 0) return await msg.channel.send("Baaa!");

	var log = [
		`Guild: ${msg.guild ? msg.guild.name : "DMs"} (${msg.guild ? msg.guild.id : msg.channel.id})`,
		`User: ${msg.author.username}#${msg.author.discriminator} (${msg.author.id})`,
		`Message: ${msg.content}`,
		`--------------------`
	];

	let {command, args} = await bot.handlers.command.parse(content);
	if(!command) {
		log.push('- Command not found -');
		console.log(log.join('\r\n'));
		bot.writeLog(log.join('\r\n'));
		return await msg.channel.send("Command not found!");
	}
	var config = {};
	var usages = {whitelist: [], blacklist: []};
	if(msg.guild) {
		config = await bot.stores.configs.get(msg.guild.id);
		usages = await bot.stores.usages.get(msg.guild.id);
	}

	try {
		var result = await bot.handlers.command.handle({command, args, msg, config, usages});
	} catch(e) {
		console.log(e);
		log.push(`Error: ${e.message ?? e}`);
		log.push(`--------------------`);
		msg.channel.send('There was an error! D:')
	}
	console.log(log.join('\r\n'));
	bot.writeLog(log.join('\r\n'));
	
	if(!result) return;
	if(Array.isArray(result)) { //embeds
		var message = await msg.channel.send({embeds: [result[0].embed ?? result[0]]});
		if(result[1]) {
			if(!bot.menus) bot.menus = {};
			bot.menus[message.id] = {
				user: msg.author.id,
				data: result,
				index: 0,
				timeout: setTimeout(()=> {
					if(!bot.menus[message.id]) return;
					try {
						message.reactions.removeAll();
					} catch(e) {
						console.log(e);
					}
					delete bot.menus[message.id];
				}, 900000),
				execute: bot.utils.paginateEmbeds
			};
			["⬅️", "➡️", "⏹️"].forEach(r => message.react(r));
		}
	} else if(typeof result == "object") {
		if(result.content || result.files) await msg.channel.send(result);
		else await msg.channel.send({embeds: [result.embed ?? result]});
	} else await msg.channel.send(result);
}