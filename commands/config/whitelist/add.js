const { Models: { SlashCommand } } = require('frame');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'add',
			description: "Add to the server's whitelist",
			options: [{
				name: 'target',
				description: "A user or role to add to the whitelist",
				type: 9,
				required: true
			}],
			usage: [
				'[target] - Adds the given target to the whitelist'
			],
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var cfg = await this.#stores.usages.get(ctx.guild.id);
		var target = ctx.options.getMentionable('target');

		var whitelist = cfg?.whitelist ?? [];
		if(!whitelist.includes(target.id)) whitelist.push(target.id);

		cfg.whitelist = whitelist;
		await cfg.save();
		return "Config updated!";
	}
}

module.exports = (bot, stores) => new Command(bot, stores);