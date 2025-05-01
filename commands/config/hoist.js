const { clearBtns } = require('../../extras');
const { Models: { SlashCommand } } = require('frame');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'hoist',
			description: "Change the role to put colored roles under",
			type: 1,
			options: [{
				name: 'role',
				description: "The role to hoist other roles up to",
				type: 8,
				required: false
			}],
			usage: [
				'- View and clear the currently set role',
				'[role] - Set the role to hoist colored roles up to'
			],
			extra: "`Hoisting` in this case refers to moving color roles up " +
				   "when they've been created or edited. By default, Sheep " +
				   "puts them under any role they have with the word `sheep` in it.",
			guildOnly: true,
			permissions: ['ManageGuild'],
			v2: true
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var role = ctx.options.getRole('role', false);
		var cfg = await this.#stores.configs.get(ctx.guild.id);

		var conf;
		if(!role) {
			if(!cfg?.hoist) return "No role set!";

			var m = await ctx.reply({
				flags: ['IsComponentsV2'],
				components: [
					{
						type: 17,
						components: [{
							type: 10,
							content:
								`**Current value:** ` +
								`<@&${cfg?.hoist}>\n` +
								`-# Interact below to reset!`
						}]
					},
					{type: 1, components: clearBtns}
				],
				fetchReply: true
			});

			conf = await this.#bot.utils.getConfirmation(this.#bot, m, ctx.user);
			if(conf.msg) return conf.msg;

			cfg.hoist = null;
			await cfg.save();
			return "Value cleared!";
		}

		cfg.hoist = role.id;
		await cfg.save();
		return "Value updated!";
	}
}

module.exports = (bot, stores) => new Command(bot, stores);