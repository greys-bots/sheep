const { clearBtns } = require('../../extras');
const { Models: { SlashCommand } } = require('frame');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'pingable',
			description: "Change whether colored roles should be pingable by everyone or not",
			type: 1,
			options: [{
				name: 'value',
				description: "The value for pingability",
				type: 5,
				required: false
			}],
			usage: [
				'- View and reset the currently set value',
				'[value] - Set the value directly'
			],
			extra: "Default setting: **false.** Roles can't be pinged by everyone",
			guildOnly: true,
			permissions: ['ManageGuild'],
			v2: true
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var val = ctx.options.getBoolean('value', false);
		var cfg = await this.#stores.configs.get(ctx.guild.id);

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
								`**Current value:** ` +
								`${cfg?.pingable ? "true" : "false"}\n` +
								`-# Interact below to reset!`
						}]
					},
					{type: 1, components: clearBtns}
				],
				fetchReply: true
			});

			conf = await this.#bot.utils.getConfirmation(this.#bot, m, ctx.user);
			if(conf.msg) return conf.msg;

			cfg.pingable = false;
			await cfg.save();
			return "Value cleared!";
		}

		cfg.pingable = val;
		await cfg.save();
		return "Value updated!";
	}
}

module.exports = (bot, stores) => new Command(bot, stores);