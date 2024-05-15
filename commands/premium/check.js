const { Models: { SlashCommand } } = require('frame');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: "check",
			description: "Check current premium status",
			usage: [
				"- Checks current status"
			],
			ephemeral: true
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var info = await this.#bot.handlers.premium.checkAccess(ctx.user.id);

		if(!info.access) {
			switch(info.error) {
				case 'none':
					return (
						"You don't have any entitlements :(\n" +
						"Check out the store on my profile to fix that!"
					)
				case 'expired':
					return (
						"You don't have any entitlements :(\n" +
						"Check out the store on my profile to resubscribe!"
					)
			}
		}

		return `Current entitlements:\n` + info.text;
	}
}

module.exports = (bot, stores) => new Command(bot, stores);