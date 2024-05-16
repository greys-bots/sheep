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
		var { access } = await this.#bot.handlers.premium.checkAccess(ctx.user.id);
		if(!access) {
			await ctx.sendPremiumRequired();
			return;
		} else return "You're already subscribed!";
	}
}

module.exports = (bot, stores) => new Command(bot, stores);