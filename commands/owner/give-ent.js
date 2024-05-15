const { Models: { SlashCommand } } = require('frame');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'give-ent',
			description: "Gives a user a test entitlement",
			options: [
				{
					name: 'user',
					description: 'The user to give to',
					type: 6,
					required: true
				},
				{
					name: "sku",
					description: "The ID of the SKU to give the entitlement for",
					type: 3,
					required: true
				}
			],
			usage: [
				'[user] [sku] - Gives the user a test entitlement'
			]
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		if(ctx.user.id !== this.#bot.owner) return "Only the bot owner can use this!";

		var user = ctx.options.getUser('user');
		var sku = ctx.options.getString('sku')?.trim();

		await this.#bot.application.entitlements.createTest({
			user: user.id,
			sku
		})

		return "Entitlement given!";
	}
}

module.exports = (bot, stores) => new Command(bot, stores);