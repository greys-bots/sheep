module.exports = async (msg, bot)=>{
	if(msg.author.bot) return;
	if(!new RegExp(`^(${bot.prefix.join("|")})`,"i").test(msg.content.toLowerCase())) return;
	var log = [
		`Guild: ${msg.guild ? msg.guild.name : "DMs"} (${msg.guild ? msg.guild.id : msg.channel.id})`,
		`User: ${msg.author.username}#${msg.author.discriminator} (${msg.author.id})`,
		`Message: ${msg.content}`,
		`--------------------`
	];
	let args = msg.content.replace(new RegExp(`^(${bot.prefix.join("|")})`,"i"), "").split(" ");
	if(!args[0]) args.shift();
	if(!args[0]) return msg.channel.send("Baaa!");
	var config;
	if(msg.guild) config = await bot.stores.configs.get(msg.guild.id);
	else config = undefined;
	let {command, nargs} = await bot.parseCommand(bot, msg, args);
	if(command) {
		if(msg.guild) {
			var check = await bot.utils.checkPermissions(bot, msg, command);
			if(!check) {
				console.log("- Missing Permissions -")
				return msg.channel.send('You do not have permission to use that command.');
			}
			check = await bot.utils.isDisabled(bot, msg.guild.id, command, command.name);
			if(check && !(["enable","disable"].includes(command.name))) {
				console.log("- Command is disabled -")
				return msg.channel.send("That command is disabled.");
			}
		} else {
			if(command.guildOnly) {
				console.log("- Command is guild only -")
				return msg.channel.send("That command can only be used in guilds.");
			}
		}
		
		try {
			var result = await command.execute(bot, msg, nargs, config);
		} catch(e) {
			console.log(e.stack);
			log.push(`Error: ${e.stack}`);
			log.push(`--------------------`);
			msg.channel.send('There was an error! D:')
		}
		console.log(log.join('\r\n'));
		bot.writeLog(log.join('\r\n'));
		
		if(!result) return;
		if(typeof result == "object" && result[0]) { //embeds
			var message = await msg.channel.send(result[0]);
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
		} else msg.channel.send(result);
	} else {
		msg.channel.send("Command not found!");
		log.push('- Command Not Found -')
	}
}