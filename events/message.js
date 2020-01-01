module.exports = async (msg, bot)=>{
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
	if(!args[0]) return msg.channel.send("Baaa!");
	var config;
	if(msg.guild) config = await bot.utils.getConfig(bot, msg.guild.id);
	else config = undefined;
	let cmd = await bot.parseCommand(bot, msg, args);
	if(cmd) {
		if(msg.guild) {
			var check = await bot.utils.checkPermissions(bot, msg, cmd[0]);
			if(!check) {
				console.log("- Missing Permissions -")
				return msg.channel.send('You do not have permission to use that command.');
			}
			check = await bot.utils.isDisabled(bot, msg.guild.id, cmd[0], cmd[2]);
			if(check && !(["enable","disable"].includes(cmd[2]))) {
				console.log("- Command is disabled -")
				return msg.channel.send("That command is disabled.");
			}
		} else {
			if(cmd.guildOnly) {
				console.log("- Command is guild only -")
				return msg.channel.send("That command can only be used in guilds.");
			}
		}
		
		var res;
		try {
			var res = await cmd[0].execute(bot, msg, cmd[1], config);
		} catch(e) {
			console.log(e.stack);
			log.push(`Error: ${e.stack}`);
			log.push(`--------------------`);
			msg.channel.send('There was an error! D:')
		}
		if(res) {
			msg.channel.send(res);
		}
	} else {
		msg.channel.send("Command not found.");
		log.push('- Command Not Found -')
	}
	console.log(log.join('\r\n'));
	bot.writeLog(log.join('\r\n'))
}