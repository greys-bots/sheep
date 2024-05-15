const { Models: { SlashCommand } } = require('frame');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: "upgrade",
			description: "Sends the upgrade link for premium",
			usage: [
				"- Sends the upgrade button"
			],
			ephemeral: true
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		await ctx.sendPremiumRequired();
		return;
	}
}

module.exports = (bot, stores) => new Command(bot, stores);