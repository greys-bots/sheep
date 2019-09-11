module.exports = {
	help: ()=> "Removes your color",
	usage: ()=> [" - Removes the color role you have"],
	execute: async (bot, msg, args, config = {role_mode: 0})=> {
		if(config.role_mode == 0) {
			var role = await bot.utils.getUserRole(bot, msg.guild, msg.author.id);
			if(!role) return "You don't have a color role!";
			await bot.deleteRole(msg.guild.id, role);
			await bot.utils.deleteUserRole(bot, role);
			return 'Color successfully removed! :D';
		} else {
			var roles = await bot.utils.getServerRoles(bot, msg.guild);
			var role = await bot.utils.getUserRole(bot, msg.guild, msg.author.id);
			if(role) {
				await bot.deleteRole(msg.guild.id, role);
			}
			if(roles) {
				for(var i = 0; i < roles.length; i++) {
					if(msg.member.roles.includes(roles[i].id)) {
						await bot.removeGuildMemberRole(msg.guild.id, msg.author.id, roles[i].id);
					}
				}
			}
			return "Color successfully removed! :D";
		}
	},
	alias: ['r', 'rmv', 'clear', 'delete']
}