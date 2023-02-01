const { Models: { SlashCommand } } = require('frame');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'view',
			description: "View the server's whitelist",
			usage: [
				"- View the current server whitelist"
			],
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var cfg = await this.#stores.usages.get(ctx.guild.id);
		if(!cfg?.whitelist?.length) return "Nothing whitelisted!";
		if(cfg.type == 2) return "Config set to blacklist mode!";

		var roles = [];
		var users = [];
		var groles = await ctx.guild.roles.fetch();
		for(var item of cfg.whitelist) {
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
			title: "Whitelist",
			description:
				`**Roles:**\n` +
				(roles.join("\n") || "(none)") +
				`\n\n**Users**\n` +
				(users.join("\n") || "(none)")
		}]}
	}
}

module.exports = (bot, stores) => new Command(bot, stores);