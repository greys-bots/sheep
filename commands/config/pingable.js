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
			permissions: ['ManageGuild']
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
				embeds: [{
					title: 'Current Value',
					description: `${cfg?.pingable ? "true" : "false"}\n` +
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

			await this.#stores.configs[cfg ? "update" : "create"](ctx.guild.id, {pingable: false});
			if(conf.interaction) await conf.interaction.update({content: "Value cleared!", components: [], embeds: []});
			else await ctx.editReply({content: "Value cleared!", components: [], embeds: []});
			return;
		}

		if(cfg) await this.#stores.configs.update(ctx.guild.id, {pingable: val});
		else await this.#stores.configs.create(ctx.guild.id, {pingable: val});
		return "Value updated!";
	}
}

module.exports = (bot, stores) => new Command(bot, stores);