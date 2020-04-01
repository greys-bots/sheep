module.exports = {
	help: ()=> "Cleans up Hex roles and makes them compatible with Sheep",
	usage: ()=> [" - Removes the `USER-` prefix on roles created by Hex to make the compatible with this bot"],
	desc: ()=> "NOTE: this role requires the `manageRoles` permission from the user. This effectively makes it moderator-only",
	execute: async (bot, msg, args)=> {
		var roles = msg.guild.roles.cache.array();
		var err = false;
		for(var i = 0; i < roles.length; i++) {
			if(roles[i].name && roles[i].name.startsWith('USER-')) {
				try {
					await roles[i].edit({name: roles[i].name.replace('USER-','')})
					await bot.utils.addUserRole(bot, msg.guild.id, roles[i].id, roles[i].name.replace("USER-",""))
					res('');
				} catch(e) {
					console.log(e);
					err = true;
					continue;
				}
			} else {
				continue;
			}
		}

		return err ? 'Some roles could not be cleaned because they are above my highest role :(' : 'Roles cleaned!'
	},
	guildOnly: true,
	alias: ['cu', 'clean'],
	permissions: ["MANAGE_ROLES"]
}