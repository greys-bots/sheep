module.exports = {
	help: ()=> "Renames your color role",
	usage: ()=> [" [name] - Sets your color role's name"],
	execute: async (bot, msg, args, config = {role_mode: 0}) => {
		if(config.role_mode == 1) return "Config set to server-based roles; you can't change your color's name :(";
		var role = await bot.utils.getUserRole(bot, msg.guild, msg.author.id);
		if(!role) return "I couldn't find your role :(";
		var success = await bot.utils.setName(bot, msg.guild.id, role, msg.author.id, args.join(" "));
		if(success) return "Role renamed!";
		else return "Something went wrong D:";
	},
	alias: ['rn']
}