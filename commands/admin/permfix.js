const { Models: { SlashCommand } } = require('frame');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'permfix',
			description: "Fix (clear) permissions from created color roles",
			usage: [
				"- Cleans up any permissions given to existing color roles"
			]
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var roles = await this.#stores.userRoles.getAll(ctx.guild.id);
		if(!roles?.[0]) return "No roles to fix!";

		await ctx.reply('Fixing roles! This might take a bit...');
		
		var errs = [];
		for(var role of roles) {
			try {
				await role.raw.edit({ permissions: 0n })
			} catch(e){
				errs.push(`${role.raw.name} (${role.raw.id}) - ${e.message ?? e}`);
			}
		}

		if(errs?.length) {
			console.log(
				`------------------------------------\n`,
				`Permfix error report for server ${ctx.guild.id}\n`,
				errs.join("\n"),
				`\n------------------------------------`
			)
			return "Some roles couldn't be fixed! Try moving my highest role up further, then trying again";
		} else return "Roles fixed!";
	}
}

module.exports = (bot, stores) => new Command(bot, stores);