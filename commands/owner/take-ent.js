const { Models: { SlashCommand } } = require('frame');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'take-ent',
			description: "Takes a test entitlement away from a user",
			options: [
				{
					name: 'user',
					description: 'The user to take from',
					type: 6,
					required: true
				},
				{
					name: "sku",
					description: "The ID of the SKU to take the entitlement from",
					type: 3,
					required: true
				}
			],
			usage: [
				'[user] [sku] - Takes a test entitlement from a user'
			]
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		if(ctx.user.id !== this.#bot.owner) return "Only the bot owner can use this!";

		var user = ctx.options.getUser('user');
		var sku = ctx.options.getString('sku')?.trim();

		var ent = await this.#bot.application.entitlements.fetch({
			user: user.id,
			skus: [sku]
		})

		ent = ent?.first()
		if(!ent) return "No entitlement to delete!";

		await this.#bot.application.entitlements.deleteTest(ent.id)

		return "Entitlement taken!";
	}
}

module.exports = (bot, stores) => new Command(bot, stores);