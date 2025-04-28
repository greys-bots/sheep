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
			ephemeral: true,
			v2: true
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var rl = ctx.options.getRole('role', false);

		var roles = await this.#stores.serverRoles.getAll(ctx.guild.id);
		if(!roles?.length) return "No roles have been indexed!";
		if(rl) roles = roles.filter(r => r.role_id == rl.id);
		if(!roles.length) return "That role isn't indexed!";

		var embeds = [];
		var cur = {
			components: [{
				type: 17,
				components: [{
					type: 10,
					content: '# Color Roles'
				}]
			}]
		}

		for(var i = 0; i < roles.length; i++) {
			if(cur.components[0].components.length >= 10) {
				embeds.push(cur);
				cur = {components: [{
					type: 17,
					components: [{
						type: 10,
						content: '# Color Roles'
					}]
				}]};
			}

			cur.components[0].components.push({
				type: 10,
				content: `**${roles[i].raw.name}** (<@&${roles[i].role_id}>)`
			})
		}
		embeds.push(cur)

		console.log(embeds.map(em => em.components[0].components))
		return embeds;
	}
}

module.exports = (bot, stores) => new Command(bot, stores);