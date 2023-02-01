const { Models: { SlashCommand } } = require('frame');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'view',
			description: "View the server's blacklist",
			usage: [
				"- View the current server blacklist"
			],
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var cfg = await this.#stores.usages.get(ctx.guild.id);
		if(!cfg?.blacklist?.length) return "Nothing blacklisted!";
		if(cfg.type == 1) return "Config set to whitelist mode!";

		var roles = [];
		var users = [];
		var groles = await ctx.guild.roles.fetch();
		for(var item of cfg.blacklist) {
			try {
				var role = groles.find(r => r.id == item);
				if(role) {
					roles.push(role.toString());
					continue;
				}
			} catch(e) { }

			try {
				var user = await this.#bot.users.fetch(item);
				if(user) users.push(user.toString());
			} catch(e) { }
		}

		return {embeds: [{
			title: "Blacklist",
			description:
				`**Roles:**\n` +
				(roles.join("\n") || "(none)") +
				`\n\n**Users**\n` +
				(users.join("\n") || "(none)")
		}]}
	}
}

module.exports = (bot, stores) => new Command(bot, stores);