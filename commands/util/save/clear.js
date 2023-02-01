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
		var msg;
		if(conf.msg) msg = conf.msg;
		else {
			await this.#stores.colors.deleteAll(ctx.user.id);
			msg = "Colors deleted!";
		}

		if(conf.interaction) {
			await conf.interaction.update({
				content: msg,
				components: [{type: 1, components: clearBtns.map((b) => {
					return {...b, disabled: true}
				})}]
			})
		} else {
			await conf.editReply({
				content: msg,
				components: [{type: 1, components: clearBtns.map((b) => {
					return {...b, disabled: true}
				})}]
			})
		}

		return;
	}
}

module.exports = (bot, stores) => new Command(bot, stores);