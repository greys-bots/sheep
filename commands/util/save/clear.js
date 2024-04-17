const { clearBtns } = require('../../../extras');
const { Models: { SlashCommand } } = require('frame');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'clear',
			description: "Delete ALL saved colors",
			usage: [
				'- Deletes all saved colors'
			],
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var m = await ctx.reply({
			content: "Are you sure you want to delete ALL saved colors?",
			components: [{type: 1, components: clearBtns}],
			fetchReply: true
		})

		var conf = await this.#bot.utils.getConfirmation(this.#bot, m, ctx.user);
		if(conf.msg) return conf.msg;

		await this.#stores.colors.deleteAll(ctx.user.id);
		return "Colors deleted!";
	}
}

module.exports = (bot, stores) => new Command(bot, stores);