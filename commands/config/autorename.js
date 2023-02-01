const { clearBtns } = require('../../extras');
const { Models: { SlashCommand } } = require('frame');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'autorename',
			description: "Change whether the bot should automatically rename your color roles",
			type: 1,
			options: [{
				name: 'value',
				description: "The value for auto-renaming",
				type: 5,
				required: false
			}],
			usage: [
				'- View and reset the current value',
				'[value] - Set the value directly'
			],
			extra: 
				"Auto-renaming will rename your colored role based on " +
				"a saved color you're using\n" +
				"Default setting: **false.** Roles aren't automatically renamed",
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var val = ctx.options.getBoolean('value', false);
		var cfg = await this.#stores.userConfigs.get(ctx.user.id);

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

			conf = await this.#bot.utils.getConfirmation(this.#bot, m, ctx.user);
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

			await this.#stores.userConfigs[cfg ? "update" : "create"](ctx.user.id, {auto_rename: false});
			if(conf.interaction) await conf.interaction.update({content: "Value cleared!", components: [], embeds: []});
			else await ctx.editReply({content: "Value cleared!", components: [], embeds: []});
			return;
		}

		if(cfg) await this.#stores.userConfigs.update(ctx.user.id, {auto_rename: val});
		else await this.#stores.userConfigs.create(ctx.user.id, {auto_rename: val});
		return "Value updated!";
	}
}

module.exports = (bot, stores) => new Command(bot, stores);