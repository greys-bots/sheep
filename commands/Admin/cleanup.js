module.exports = {
	help: ()=> "Cleans up unused roles from users that have left",
	usage: ()=> [" - Deletes any roles that are no longer needed"],
	execute: async (bot, msg, args)=> {
		var roles = await bot.stores.userRoles.getAll(msg.guild.id);
		if(!roles?.[0]) return "No roles to delete!";
		
		var members = await msg.guild.members.fetch();
		var err = false;
		for(var i = 0; i < roles.length; i++) {
			if(members.get(roles[i].user_id)) continue;

			try {
				await roles[i].raw.delete();
			} catch(e) {
				err = true;
			}
		}

		if(err) return 'Some roles could not be cleaned because they are above my highest role :(';
		else return 'Roles cleaned!'
	},
	guildOnly: true,
	alias: ['cu', 'clean'],
	permissions: ["MANAGE_ROLES"]
}