module.exports = {
	help: ()=> "Renames your color role",
	usage: ()=> [" [name] - Sets your color role's name"],
	execute: async (bot, msg, args, config = {role_mode: 0}) => {
		if(config.role_mode == 1) return "Config set to server-based roles; you can't change your color's name :(";
		var role = await bot.stores.userRoles.get(msg.guild.id, msg.member.id);
		if(!role) return "Either you don't have a color role or I can't find it :(";

		var arg = args.join(" ");
		if(arg.length > 32) return 'That name is too long! Roles must be 32 characters or less';
		try {
			role.raw.edit({name: arg});
		} catch(e) {
			console.log(e);
			return "ERR: "+e.message;
		}
		
		return "Role renamed!";
	},
	guildOnly: true,
	alias: ['rn']
}