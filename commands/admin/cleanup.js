const { Models: { SlashCommand } } = require('frame');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'cleanup',
			description: "Delete roles from users that have left",
			usage: [
				"- Deletes any roles left by users who are no longer in the server"
			]
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var roles = await this.#stores.userRoles.getAll(ctx.guild.id);
		if(!roles?.[0]) return "No roles to delete!";

		var members = await ctx.guild.members.fetch();
		await ctx.deferReply();
		
		var err = false;
		for(var role of roles) {
			if(members.get(role.user_id)) continue;

			try {
				role.raw.delete()
			} catch(e){ err = true; }
		}

		if(err) return "Some roles couldn't be deleted! Try moving my highest role up further, then trying again";
		else return "Roles cleaned!";
	}

	async auto(ctx) {
	}
}

module.exports = (bot, stores) => new Command(bot, stores);