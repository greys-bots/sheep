const { clearBtns } = require('../../extras');

module.exports = {
	data: {
		name: 'readout',
		description: "Change whether the bot should show the a11y readout",
		type: 1,
		options: [{
			name: 'value',
			description: "The value for showing the readout",
			type: 5,
			required: false
		}]
	},
	usage: [
		'- View and reset the current value',
		'[value] - Set the value directly'
	],
	extra: "Default setting: **false.** The readout will not be shown",
	async execute(ctx) {
		var val = ctx.options.getBoolean('value', false);
		var cfg = await ctx.client.stores.userConfigs.get(ctx.user.id);

		var conf;
		if(val == null) {
			var m = await ctx.reply({
				embeds: [{
					title: 'Current Value',
					description: `${cfg?.a11y ? "true" : "false"}\n` +
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

			await ctx.client.stores.userConfigs[cfg ? "update" : "create"](ctx.user.id, {a11y: false});
			if(conf.interaction) await conf.interaction.update({content: "Value cleared!", components: [], embeds: []});
			else await ctx.editReply({content: "Value cleared!", components: [], embeds: []});
			return;
		}

		await ctx.client.stores.userConfigs[cfg ? "update" : "create"](ctx.user.id, {a11y: val});
		return "Value updated!";
	}
}