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
			ephemeral: true
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var roles = await this.#stores.serverRoles.getAll(ctx.guild.id);
		if(!roles?.length) return "No server-based roles are available!";

		var embeds = await this.#bot.utils.genEmbeds(
			this.#bot,
			roles,
			(r) => {
				return {
					name: r.raw.name,
					value: `<@&${r.role_id}>`
				}
			},
			{
				title: "Color Roles"
			}
		)

		embeds = embeds.map(e => e.embed)
		return embeds;
	}
}

module.exports = (bot, stores) => new Command(bot, stores);