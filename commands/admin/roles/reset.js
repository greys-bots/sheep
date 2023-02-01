const { Models: { SlashCommand } } = require('frame');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'reset',
			description: "Remove all server-based roles from the database, optionally deleting their associated roles",
			type: 1,
			options: [{
				name: 'delete',
				description: "Whether the roles should be deleted or not",
				type: 5,
				required: false
			}],
			usage: [
				"- Remove all server roles from the database, leaving the associated roles intact",
				"[delete: true] - Removes all server roles from the database, deleting the associated roles from the guild"
			],
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var del = ctx.options.getBoolean('delete', false);

		var roles = await this.#stores.serverRoles.getAll(ctx.guild.id);
		if(!roles?.length) return "No server roles indexed!";

		var err = false;
		if(del) {
			await ctx.deferReply();
			for(var role of roles) {
				try {
					await role.raw.delete();
				} catch(e) {
					err = true;
				}
			}
		}

		await this.#stores.serverRoles.deleteAll(ctx.guild.id);

		if(err) return "Some roles couldn't be deleted; you'll have to manually delete the rest!";
		else if(del) return "Roles deleted!";
		else return "Roles removed from the database!";
	}
}

module.exports = (bot, stores) => new Command(bot, stores);