const btns = [
	{
		type: 2,
		label: 'Unlink',
		style: 4,
		custom_id: 'clear'
	},
	{
		type: 2,
		label: 'Cancel',
		style: 1,
		custom_id: 'cancel'
	}
]

module.exports = {
	data: {
		name: 'unlink',
		description: "Unlink your role with another person",
		options: [{
			name: 'user',
			description: 'The user to unlink with',
			type: 6,
			required: true
		}]
	},
	usage: [
		'[user] - Unlink roles with another user'
	],
	async execute(ctx) {
		var cfg = await ctx.client.stores.configs.get(ctx.guild.id);
		if(cfg && cfg.role_mode == 1) return "Can't link or unlink colors in server-based color mode!";
		var user = ctx.options.getUser('user');

		var role = await ctx.client.stores.userRoles.get(ctx.guild.id, ctx.user.id);
		if(!role) return "You don't have a role to unlink!";
		var role2 = await ctx.client.stores.userRoles.get(ctx.guild.id, user.id);
		if(role.role_id != role2.role_id) return "Your roles aren't linked!";

		var msg = await ctx.reply({
			content: `Are you sure you want to unlink roles with <@${user.id}>?`,
			components: [{
				type: 1,
				components: btns
			}],
			allowedMentions: {
				parse: []
			},
			fetchReply: true
		});

		var conf = await ctx.client.utils.getConfirmation(ctx.client, msg, ctx.user);

		var msg;
		if(conf.msg) msg = conf.msg;
		else {
			await ctx.member.roles.remove(role.role_id);
			await ctx.client.stores.userRoles.unlink(ctx.guild.id, role.role_id, ctx.user.id);
			msg = "Roles unlinked!";
		}

		if(conf.interaction) {
			await conf.interaction.update({
				content: msg,
				components: [{
					type: 1,
					components: btns.map(c => {
						return {...c, disabled: true}
					})
				}]
			})
		} else {
			await ctx.editReply({
				content: msg,
				components: [{
					type: 1,
					components: btns.map(c => {
						return {...c, disabled: true}
					})
				}]
			})
		}

		return;
	}
}