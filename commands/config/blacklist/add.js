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
		var target = ctx.options.getMentionable('target');

		var blacklist = cfg?.blacklist ?? [];
		if(!blacklist.includes(target.id)) blacklist.push(target.id);

		if(cfg) await this.#stores.usages.update(ctx.guild.id, {blacklist});
		else await this.#stores.usages.create(ctx.guild.id, {blacklist});
		return "Config updated!";
	}
}

module.exports = (bot, stores) => new Command(bot, stores);