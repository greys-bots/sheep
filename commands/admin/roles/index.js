const { Models: { SlashCommand } } = require('frame');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'index',
			description: "Index an existing role to use for server-based colors",
			type: 1,
			options: [{
				name: 'role',
				description: "The role to index",
				type: 8,
				required: true
			}],
			usage: [
				'[role] - Indexes the given role'
			],
			extra: "If you want to create a new role, use the `create` command instead",
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var role = ctx.options.getRole('role');

		var existing = await this.#stores.serverRoles.get(ctx.guild.id, role.id);
		if(existing) return "That role is already indexed!";

		await this.#stores.serverRoles.create({
			server_id: ctx.guild.id,
			role_id: role.id
		});
		return "Role indexed!";
	}
}

module.exports = (bot, stores) => new Command(bot, stores);