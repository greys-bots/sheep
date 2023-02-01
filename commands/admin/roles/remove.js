const { Models: { SlashCommand } } = require('frame');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'remove',
			description: "Remove a server-based role, deleting it from the database",
			type: 1,
			options: [
				{
					name: 'role',
					description: "The role to remove from the database",
					type: 8,
					required: true
				},
				{
					name: 'delete',
					description: "Whether the role being removed should be deleted",
					type: 5,
					required: false
				}
			],
			usage: [
				"[role] - Removes the given role from the server's role list"
			],
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var role = ctx.options.getRole('role');
		var del = ctx.options.getBoolean('delete', false);
		var exists = await this.#stores.serverRoles.get(ctx.guild.id, role.id);
		if(!exists) return "Role not indexed!";

		try {
			await this.#stores.serverRoles.delete(ctx.guild.id, role.id);
			if(del) await role.delete();
		} catch(e) {
			return "ERR: "+e;
		}

		return "Role removed!";
	}
}

module.exports = (bot, stores) => new Command(bot, stores);