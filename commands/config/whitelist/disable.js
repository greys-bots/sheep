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

		if(cfg) await this.#stores.usages.update(ctx.guild.id, {type: 0});
		else await this.#stores.usages.create(ctx.guild.id, {type: 0});
		return "Config updated!";
	}
}

module.exports = (bot, stores) => new Command(bot, stores);