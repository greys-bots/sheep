module.exports = {
	help: ()=> "Renames your color role",
	usage: ()=> [" [name] - Sets your color role's name"],
	execute: async (bot, msg, args, config = {role_mode: 0}) => {
		if(config.role_mode == 1) return "Config set to server-based roles; you can't change your color's name :(";
		var role = await bot.stores.userRoles.get(msg.guild.id, msg.member.id);
		if(!role) return "Either you don't have a color role or I can't find it :(";

		try {
			role.raw.edit({name: args.join(" ")});
		} catch(e) {
			console.log(e);
			return "ERR: "+e.message;
		}
		
		return "Role renamed!";
	},
	guildOnly: true,
	alias: ['rn']
}