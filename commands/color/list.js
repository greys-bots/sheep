const { Models: { SlashCommand } } = require('frame');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'list',
			description: "View the color roles available in the server",
			usage: [
				"- List all color roles available in the server",
			],
			ephemeral: true,
			v2: true
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var roles = await this.#stores.serverRoles.getAll(ctx.guild.id);
		if(!roles?.length) return "No server-based roles are available!";

		var comps = this.#bot.utils.genComps(
			roles,
			(r) => ({
				type: 10,
				content: `${r.raw.name} (<@&${r.role_id}>)`
			})
		)
		var embeds = comps.map(c => {
			return {
				components: [{
					type: 17,
					components: [
						{
							type: 10,
							content: '# Color Roles'
						},
						...c
					]
				}]
			}
		})

		return embeds;
	}
}

module.exports = (bot, stores) => new Command(bot, stores);