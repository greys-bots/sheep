const { clearBtns } = require('../../extras');
const { Models: { SlashCommand } } = require('frame');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'readout',
			description: "Change whether the bot should show the a11y readout",
			type: 1,
			options: [{
				name: 'value',
				description: "The value for showing the readout",
				type: 5,
				required: false
			}],
			usage: [
				'- View and reset the current value',
				'[value] - Set the value directly'
			],
			extra: "Default setting: **false.** The readout will not be shown",
			v2: true
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
				flags: ['IsComponentsV2'],
				components: [
					{
						type: 17,
						components: [{
							type: 10,
							content:
								`### Current value\n` +
								`${cfg?.a11y ? "true" : "false"}\n` +
								`-# Interact below to reset!`
						}]
					},
					{type: 1, components: clearBtns}
				],
				fetchReply: true
			});

			conf = await this.#bot.utils.getConfirmation(this.#bot, m, ctx.user);
			if(conf.msg) return conf.msg;

			cfg.readout = false;
			await cfg.save();
			return "Value cleared!";
		}

		cfg.readout = val;
		await cfg.save();
		return "Value updated!";
	}
}

module.exports = (bot, stores) => new Command(bot, stores);