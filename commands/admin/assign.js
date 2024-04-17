const tc = require('tinycolor2');
const { Models: { SlashCommand } } = require('frame');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'assign',
			description: "Assign a color/role to a user",
			options: [
				{
					name: 'user',
					description: "The user to assign to",
					type: 6,
					required: true
				},
				{
					name: 'value',
					description: "The role (mention) or color to assign to the user",
					type: 3,
					required: true
				}
			],
			usage: [
				'[user] [value: color] - Assigns a color to the user',
				'[user] [value: role mention] - Assigns the mentioned role to the user'
			]
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var user = ctx.options.getMember('user');
		var role = ctx.options.resolved.roles?.first();
		var val = ctx.options.getString('value', false);
		if(!val) return "Please provide a role mention or a color!";
		
		var urole = await this.#stores.userRoles.get(ctx.guild.id, user.id);

		if(role) {
			if(urole) return "That user already has a color role!";

			await this.#stores.userRoles.create({
				server_id: ctx.guild.id,
				user_id: user.id,
				role_id: role.id
			});
			await user.roles.add(role.id);
			return "Role assigned!"
		}

		var c = tc(val);
		if(!c.isValid()) return "Please provide a valid color!";

		var cfg = await this.#stores.configs.get(ctx.guild.id);
		if(!cfg) cfg = {};
		
		var srole;
		if(cfg.hoist) srole = await ctx.guild.roles.fetch(cfg.hoist);
		else srole = ctx.guild.members.me.roles.cache.find(r => r.name.toLowerCase().includes("sheep") || r.managed);

		var opts = {
			name: urole?.raw?.name ?? user.user.username,
			color: c.toHex(),
			mentionable: cfg.pingable,
			permissions: urole?.raw?.permissions ?? 0n
		}

		try {
			var rl;
			if(urole?.raw) {
				rl = await urole.raw.edit({
					...opts,
					position: srole?.position - 1 ?? 0
				});
			} else {
				rl = await ctx.guild.roles.create({
					...opts,
					position: srole?.position ?? 0
				});
				await this.#stores.userRoles.create({
					server_id: ctx.guild.id,
					user_id: user.id,
					role_id: rl.id
				});
			}

			await user.roles.add(rl.id);
		} catch(e) {
			console.log(e)
			return `ERR: `+e.message;
		}

		return "Color assigned!"
	}
}

module.exports = (bot, stores) => new Command(bot, stores);