module.exports = {
	data: {
		name: 'cleanup',
		description: "Delete roles from users that have left"
	},
	usage: ["- Deletes any roles left by users who are no longer in the server"],
	async execute(ctx) {
		var roles = ctx.client.stores.userRoles.getAll(ctx.guildId);
		if(!roles?.[0]) return "No roles to delete!";

		var members = await ctx.guild.members.fetch();
		await ctx.deferReply();
		
		var err = false;
		for(var role of roles) {
			if(members.get(role.user_id)) continue;

			try {
				role.raw.delete()
			} catch(e){ err = true; }
		}

		if(err) return "Some roles couldn't be deleted! Try moving my highest role up further, then trying again";
		else return "Roles cleaned!";
	}
}