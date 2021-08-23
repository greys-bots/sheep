const { confBtns } = require('../../extras');

module.exports = {
	data: {
		name: 'link',
		description: "Link your role with another person",
		options: [{
			name: 'user',
			description: 'The user to link with',
			type: 6,
			required: true
		}]
	},
	usage: [
		'[user] - Link roles with another user'
	],
	extra: "Linking roles means that the color can be changed by either account",
	async execute(ctx) {
		var cfg = await ctx.client.stores.configs.get(ctx.guildId);
		if(cfg.role_mode == 1) return "Can't link colors in server-based color mode!";

		var role = await ctx.client.stores.userRoles.get(ctx.guildId, ctx.user.id);
		if(!role) return "You don't have a role to link!";

		var user = ctx.options.getMember('user');
		var msg = await ctx.reply({
			content: `<@${user.id}>, please confirm you'd like to link roles!`,
			components: [{
				type: 1,
				components: confBtns
			}],
			fetchReply: true
		});

		var conf = await ctx.client.utils.getConfirmation(ctx.client, msg, user);

		var msg;
		if(conf.msg) msg = conf.msg;
		else {
			var existing = await ctx.client.stores.userRoles.get(ctx.guildId, user.id);
			if(existing) await ctx.client.stores.userRoles.delete(ctx.guildId, user.id);

			await ctx.client.stores.userRoles.create(ctx.guildId, user.id, role.role_id);
			await user.roles.add(role.role_id);
			msg = "Roles linked!";
		}

		if(conf.interaction) {
			await conf.interaction.update({
				content: msg,
				components: [{
					type: 1,
					components: confBtns.map(c => {
						return {...c, disabled: true}
					})
				}]
			})
		} else {
			await ctx.editReply({
				content: msg,
				components: [{
					type: 1,
					components: confBtns.map(c => {
						return {...c, disabled: true}
					})
				}]
			})
		}

		return;
	}
}