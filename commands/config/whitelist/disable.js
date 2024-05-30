const { Models: { SlashCommand } } = require('frame');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'disable',
			description: "Disable the server's whitelist",
			usage: [
				'- Disables the whitelist'
			],
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var cfg = await this.#stores.usages.get(ctx.guild.id);
		if(!cfg?.id) cfg = await this.#stores.usages.create({ server_id: ctx.guild.id });

		cfg.type = 0;
		await cfg.save();
		return "Config updated!";
	}
}

module.exports = (bot, stores) => new Command(bot, stores);