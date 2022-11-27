module.exports = {
	data: {
		name: 'rename',
		description: "Rename your current color role",
		options: [{
			name: 'name',
			description: "The new role name",
			type: 3,
			required: true
		}]
	},
	usage: [
		"[name] - Changes your role's name"
	],
	async execute(ctx) {
		var cfg = await ctx.client.stores.configs.get(ctx.guild.id);
		if(!cfg) cfg = {role_mode: 0};

		if(cfg.role_mode == 1) return "Config set to server-based roles; you can't change your color's name :(";
		var role = await ctx.client.stores.userRoles.get(ctx.guild.id, ctx.member.id);
		if(!role) return "Either you don't have a color role or I can't find it :(";

		var arg = ctx.options.getString('name', false)?.trim().toLowerCase();
		if(arg.length > 32) return 'That name is too long! Roles must be 32 characters or less';
		try {
			role.raw.edit({name: arg});
		} catch(e) {
			console.log(e);
			return "ERR: "+e.message;
		}
		
		return "Role renamed!";
	}
}