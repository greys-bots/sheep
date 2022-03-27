const { clearBtns } = require('../../extras');

module.exports = {
	data: {
		name: 'hoist',
		description: "Change the role to put colored roles under",
		type: 1,
		options: [{
			name: 'role',
			description: "The role to hoist other roles up to",
			type: 8,
			required: false
		}]
	},
	usage: [
		'- View and clear the currently set role',
		'[role] - Set the role to hoist colored roles up to'
	],
	extra: "`Hoisting` in this case refers to moving color roles up " +
		   "when they've been created or edited. By default, Sheep " +
		   "puts them under any role they have with the word `sheep` in it.",
	async execute(ctx) {
		var role = ctx.options.getRole('role', false);
		var cfg = await ctx.client.stores.configs.get(ctx.guildId);

		var conf;
		if(!role) {
			if(!cfg?.hoist) return "No role set!";

			var m = await ctx.reply({
				embeds: [{
					title: 'Current Value',
					description: `<@&${cfg?.hoist}>\n` +
								 `Interact below to reset!`
				}],
				components: [{type: 1, components: clearBtns}],
				fetchReply: true
			});

			conf = await ctx.client.utils.getConfirmation(ctx.client, m, ctx.user);
			if(conf.msg) {
				if(conf.interaction) await conf.interaction.update({
					content: conf.msg,
					components: []
				});
				else await ctx.editReply({
					content: conf.msg,
					components: []
				});
				return;
			}

			await ctx.client.stores.configs[cfg ? "update" : "create"](ctx.guildId, {hoist: null});
			if(conf.interaction) await conf.interaction.update({content: "Value cleared!", components: [], embeds: []});
			else await ctx.editReply({content: "Value cleared!", components: [], embeds: []});
			return;
		}

		if(cfg) await ctx.client.stores.configs.update(ctx.guildId, {hoist: role.id});
		else await ctx.client.stores.configs.create(ctx.guildId, {hoist: role.id});
		return "Value updated!";
	},
	guildOnly: true,
	permissions: ['MANAGE_GUILD']
}