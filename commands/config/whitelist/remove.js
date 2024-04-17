const { Models: { SlashCommand } } = require('frame');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'remove',
			description: "Remove from the server's whitelist",
			options: [{
				name: 'target',
				description: "A user or role to remove from the whitelist",
				type: 9,
				required: true
			}],
			usage: [
				'[target] - Removes the given target from the whitelist'
			],
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var cfg = await this.#stores.usages.get(ctx.guild.id);
		if(!cfg?.whitelist?.length) return "Nothing to remove!";
		var target = ctx.options.getMentionable('target');

		var whitelist = cfg.whitelist.filter(x => x != target.id);

		cfg.whitelist = whitelist;
		await cfg.save();
		return "Config updated!";
	}
}

module.exports = (bot, stores) => new Command(bot, stores);