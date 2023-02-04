const { Models: { SlashCommand } } = require('frame');
const tc = require('tc');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'edit',
			description: "Edit a role's name or color",
			type: 1,
			options: [
				{
					name: 'role',
					description: "The role to edit",
					type: 8,
					required: true
				},
				{
					name: 'option',
					description: "The option to edit",
					type: 3,
					required: true,
					choices: [
						{
							name: 'name',
							value: 'name'
						},
						{
							name: 'color',
							value: 'color'
						}
					]
				},
				{
					name: 'value',
					description: "The new value",
					type: 3,
					required: true
				}
			],
			usage: [
				'[role] [option: name] [value: new name] - Change the name of a role',
				'[role] [option: color] [value: new color] - Change the color of a role'
			],
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var role = ctx.options.getRole('role');
		var option = ctx.options.getString('option');
		var value = ctx.options.getString('value');

		switch(option) {
			case 'name':
				if(value.length > 100) return "Name must be 100 characters or less!";
				break;
			case 'color':
				var c = tc(value);
				if(!c.isValid()) return "Color must be valid!";
				value = parseInt(c.toHex(), 16);
				break;
		}

		var resp = await role.edit({[option]: value});
		return "Role edited!";
	}
}

module.exports = (bot, stores) => new Command(bot, stores);