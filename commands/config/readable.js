const { clearBtns } = require('../../extras');
const { Models: { SlashCommand } } = require('frame');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'readable',
			description: "Change whether readable/accessible colors are required",
			type: 1,
			options: [{
				name: 'value',
				description: "The value for readability",
				type: 5,
				required: false
			}],
			usage: [
				'- View and reset the currently set value',
				'[value] - Set the value directly'
			],
			extra: "Default setting: **false.** Readable colors aren't required",
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
					description: `${cfg?.readable ? "true" : "false"}\n` +
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

			await this.#stores.configs[cfg ? "update" : "create"](ctx.guild.id, {readable: false});
			if(conf.interaction) await conf.interaction.update({content: "Value cleared!", components: [], embeds: []});
			else await ctx.editReply({content: "Value cleared!", components: [], embeds: []});
			return;
		}

		if(cfg) await this.#stores.configs.update(ctx.guild.id, {readable: val});
		else await this.#stores.configs.create(ctx.guild.id, {readable: val});
		return "Value updated!";
	}
}

module.exports = (bot, stores) => new Command(bot, stores);