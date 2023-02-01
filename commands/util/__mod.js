const { Models: { SlashCommand } } = require('frame');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'util',
			description: "Utility commands",
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
	}

	async auto(ctx) {
	}
}

module.exports = (bot, stores) => new Command(bot, stores);