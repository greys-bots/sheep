const { Models: { SlashCommand } } = require('frame');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'add',
			description: "Add to the server's blacklist",
			options: [{
				name: 'target',
				description: "A user or role to add to the blacklist",
				type: 9,
				required: true
			}],
			usage: [
				'[target] - Adds the given target to the blacklist'
			],
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var cfg = await this.#stores.usages.get(ctx.guild.id);
		if(!cfg?.id) cfg = await this.#stores.usages.create({ server_id: ctx.guild.id })
		var target = ctx.options.getMentionable('target');

		var blacklist = cfg.blacklist ?? [];
		if(!blacklist.includes(target.id)) blacklist.push(target.id);

		cfg.blacklist = blacklist;
		await cfg.save();
		return "Config updated!";
	}
}

module.exports = (bot, stores) => new Command(bot, stores);