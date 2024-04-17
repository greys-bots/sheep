const { Models: { SlashCommand } } = require('frame');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'enable',
			description: "Enable the server's blacklist",
			usage: [
				'- Enables the blacklist'
			],
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var cfg = await this.#stores.usages.get(ctx.guild.id);

		cfg.type = 2;
		await cfg.save();
		return "Config updated!";
	}
}

module.exports = (bot, stores) => new Command(bot, stores);