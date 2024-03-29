const { Models: { SlashCommand } } = require('frame');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'enable',
			description: "Enable the server's whitelist",
			usage: [
				'- Enables the whitelist'
			],
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var cfg = await this.#stores.usages.get(ctx.guild.id);

		if(cfg) await this.#stores.usages.update(ctx.guild.id, {type: 1});
		else await this.#stores.usages.create(ctx.guild.id, {type: 1});
		return "Config updated!";
	}
}

module.exports = (bot, stores) => new Command(bot, stores);