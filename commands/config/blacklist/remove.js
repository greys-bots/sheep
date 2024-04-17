const { Models: { SlashCommand } } = require('frame');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'remove',
			description: "Remove from the server's blacklist",
			options: [{
				name: 'target',
				description: "A user or role to remove from the blacklist",
				type: 9,
				required: true
			}],
			usage: [
				'[target] - Removes the given target from the blacklist'
			],
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var cfg = await this.#stores.usages.get(ctx.guild.id);
		if(!cfg?.blacklist?.length) return "Nothing to remove!";
		var target = ctx.options.getMentionable('target');

		var blacklist = cfg.blacklist.filter(x => x != target.id);

		cfg.blacklist = blacklist;
		await cfg.save();
		return "Config updated!";
	}
}

module.exports = (bot, stores) => new Command(bot, stores);