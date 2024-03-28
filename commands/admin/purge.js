const { Models: { SlashCommand } } = require('frame');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'purge',
			description: "Delete all created user roles",
			usage: [
				"- Deletes all existing user-based color roles"
			]
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var roles = await this.#stores.userRoles.getAll(ctx.guild.id);
		if(!roles?.[0]) return "No roles to delete!";

		await ctx.reply('Deleting roles! This might take a bit...');
		
		var errs = [];
		for(var role of roles) {
			try {
				await role.raw.delete();
			} catch(e){
				errs.push(`${role.raw.name} (${role.raw.id}) - ${e.message ?? e}`);
			}
		}

		if(errs?.length) {
			console.log(
				`------------------------------------\n`,
				`Purge error report for server ${ctx.guild.id}\n`,
				errs.join("\n"),
				`\n------------------------------------`
			)
			return "Some roles couldn't be deleted! Try moving my highest role up further, then trying again";
		} else return "Roles deleted!";
	}
}

module.exports = (bot, stores) => new Command(bot, stores);