const { Models: { SlashCommand } } = require('frame');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'view',
			description: "View the server's color roles",
			type: 1,
			options: [{
				name: 'role',
				description: "A specific role to view",
				type: 8,
				required: false
			}],
			usage: [
				"- List all color roles indexed in the server",
				"[role] - View a specific role to see if it's indexed"
			],
			permissions: [],
			ephemeral: true
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var rl = ctx.options.getRole('role', false);

		var roles = await this.#stores.serverRoles.getAll(ctx.guild.id);
		if(!roles?.length) return "No indexed roles";
		if(rl) roles = roles.filter(r => r.role_id == rl.id);
		if(!roles.length) return "That role isn't indexed!";

		var embeds = roles.map(r => {
			var c = r.raw.color?.toString(16).toUpperCase();
			return {
				title: r.raw.name,
				description: `Color: ${c ?? "(no color)" }\nPreview: <@&${r.role_id}>`,
				color: r.raw.color,
				image: {url: `https://sheep.greysdawn.com/sheep/${c}`}
			}
		})

		if(embeds.length > 1) for(var i = 0; i < embeds.length; i++) embeds[i].title += ` (${i+1}/${embeds.length})`;

		return embeds;
	}
}

module.exports = (bot, stores) => new Command(bot, stores);