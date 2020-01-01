module.exports = async (reaction, user, bot)=> {
	if(bot.user.id == user) return;

	var msg;
	if(reaction.message.partial) msg = await reaction.message.fetch();
	else msg = reaction.message;

	var config;
	if(msg.channel.guild) config = await bot.utils.getConfig(bot, msg.channel.guild.id);
	else config = undefined;

	if(bot.menus && bot.menus[msg.id] && bot.menus[msg.id].user == user) {
		try {
			await bot.menus[msg.id].execute(msg, reaction, config);
		} catch(e) {
			console.log(e);
			bot.writeLog(e);
			msg.channel.send("Something went wrong: "+e.message);
		}
	}
}