const { Models: { SlashCommand } } = require('frame');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'remove',
			description: "Remove your current color",
			usage: [
				"- Removes your current color"
			],
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var cfg = await this.#stores.configs.get(ctx.guild.id);
		if(!cfg) cfg = {role_mode: 0};

		if(cfg.role_mode == 0) {
			var role = await this.#stores.userRoles.get(ctx.guild.id, ctx.member.id);
			if(!role) return "You don't have a color role!";
			var linked = await this.#stores.userRoles.getLinked(ctx.guild.id, role.role_id);
			try {
				if(linked?.length && linked.find(x => x.id !== role.id)) {
					await ctx.member.roles.remove(role.role_id);
					await role.delete();
				} else await role.raw.delete("Removed color");
			} catch(e) {
				console.log(e);
				return "ERR: "+e.message;
			}
			
			return 'Color successfully removed! :D';
		} else {
			var roles = await this.#stores.serverRoles.getAll(ctx.guild.id);
			var role = await this.#stores.userRoles.get(ctx.guild.id, ctx.member.id);
			if(role) {
				try {
					await role.raw.delete("Removed color");
				} catch(e) {
					console.log(e);
					return "ERR: "+e.message;
				}
			}

			if(roles) {
				await ctx.member.roles.remove(roles.map(x => x.role_id));
			}

			return "Color successfully removed! :D";
		}
	}
}

module.exports = (bot, stores) => new Command(bot, stores);