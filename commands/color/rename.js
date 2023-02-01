const { Models: { SlashCommand } } = require('frame');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'rename',
			description: "Rename your current color role",
			options: [{
				name: 'name',
				description: "The new role name",
				type: 3,
				required: true
			}],
			usage: [
				"[name] - Changes your role's name"
			],
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var cfg = await this.#stores.configs.get(ctx.guild.id);
		if(!cfg) cfg = {role_mode: 0};

		if(cfg.role_mode == 1) return "Config set to server-based roles; you can't change your color's name :(";
		var role = await this.#stores.userRoles.get(ctx.guild.id, ctx.member.id);
		if(!role) return "Either you don't have a color role or I can't find it :(";

		var arg = ctx.options.getString('name', false)?.trim().toLowerCase();
		if(arg.length > 32) return 'That name is too long! Roles must be 32 characters or less';
		try {
			role.raw.edit({name: arg});
		} catch(e) {
			console.log(e);
			return "ERR: "+e.message;
		}
		
		return "Role renamed!";
	}
}

module.exports = (bot, stores) => new Command(bot, stores);