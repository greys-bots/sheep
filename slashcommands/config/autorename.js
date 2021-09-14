const { clearBtns } = require('../../extras');

module.exports = {
	data: {
		name: 'autorename',
		description: "Change whether the bot should automatically rename your color roles",
		type: 1,
		options: [{
			name: 'value',
			description: "The value for auto-renaming",
			type: 5,
			required: false
		}]
	},
	usage: [
		'- View and reset the current value',
		'[value] - Set the value directly'
	],
	extra: 
		"Auto-renaming will rename your colored role based on " +
		"a saved color you're using\n" +
		"Default setting: **false.** Roles aren't automatically renamed",
	async execute(ctx) {
		var val = ctx.options.getBoolean('value', false);
		var cfg = await ctx.client.stores.userConfigs.get(ctx.user.id);

		var conf;
		if(val == null) {
			var m = await ctx.reply({
				embeds: [{
					title: 'Current Value',
					description: `${cfg?.auto_rename ? "true" : "false"}\n` +
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

			await ctx.client.stores.userConfigs[cfg ? "update" : "create"](ctx.user.id, {auto_rename: false});
			if(conf.interaction) await conf.interaction.update({content: "Value cleared!", components: [], embeds: []});
			else await ctx.editReply({content: "Value cleared!", components: [], embeds: []});
			return;
		}

		await ctx.client.stores.userConfigs[cfg ? "update" : "create"](ctx.user.id, {auto_rename: val});
		return "Value updated!";
	}
}