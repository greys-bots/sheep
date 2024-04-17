const tc = require('tinycolor2');
const { Models: { SlashCommand } } = require('frame');
const { ApplicationCommandOptionType: ACOT } = require('discord.js');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'create',
			description: "Create a new server-based role",
			type: 1,
			options: [
				{
					name: 'name',
					description: "The role's name",
					type: ACOT.String,
					required: true
				},
				{
					name: 'color',
					description: "The color of the role",
					type: ACOT.String,
					required: true
				}
			],
			usage: [
				'[role] [color] - Create a new role for usage with server-based colors'
			],
			extra: "If you want to use an existing role, use the `index` command instead",
		})

		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var name = ctx.options.getString('name');
		var color = ctx.options.getString('color');
		color = tc(color);
		if(!color.isValid()) return "That color isn't valid!";
		color = color.toHex().toLowerCase();
		if(name.length > 100) return "Names must be 100 characters or less!";
		if(color == '000000') color = parseInt('000001', 16);
		else color = parseInt(color, 16);

		await ctx.deferReply();
		var role = await ctx.guild.roles.create({name, color, permissions: 0n});
		await this.#stores.serverRoles.create({
			server_id: ctx.guild.id,
			role_id: role.id
		});
		return "Role created!";
	}
}

module.exports = (bot, stores) => new Command(bot, stores);