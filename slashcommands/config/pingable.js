const { clearBtns } = require('../../extras');

module.exports = {
	data: {
		name: 'pingable',
		description: "Change whether colored roles should be pingable by everyone or not",
		type: 1,
		options: [{
			name: 'value',
			description: "The value for pingability",
			type: 5,
			required: false
		}]
	},
	usage: [
		'- View and reset the currently set value',
		'[value] - Set the value directly'
	],
	extra: "Default setting: **false.** Roles can't be pinged by everyone",
	async execute(ctx) {
		var val = ctx.options.getBoolean('value', false);
		var cfg = await ctx.client.stores.configs.get(ctx.guildId);

		var conf;
		if(val == null) {
			var m = await ctx.reply({
				embeds: [{
					title: 'Current Value',
					description: `${cfg?.pingable ? "true" : "false"}\n` +
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

			await ctx.client.stores.configs[cfg ? "update" : "create"](ctx.guildId, {pingable: false});
			if(conf.interaction) await conf.interaction.update({content: "Value cleared!", components: [], embeds: []});
			else await ctx.editReply({content: "Value cleared!", components: [], embeds: []});
			return;
		}

		await ctx.client.stores.configs[cfg ? "update" : "create"](ctx.guildId, {pingable: val});
		return "Value updated!";
	},
	guildOnly: true,
	permissions: ['MANAGE_GUILD']
}