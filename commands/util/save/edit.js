const tc = require('tinycolor2');
const { Models: { SlashCommand } } = require('frame');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'edit',
			description: "Edit a saved color",
			options: [
				{
					name: 'name',
					description: "The color to edit",
					type: 3,
					required: true
				},
				{
					name: 'prop',
					description: "The property to edit",
					type: 3,
					required: true,
					choices: [
						{
							name: "name",
							value: "name"
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
				'[name] [prop] [value] - Edit a specified color'
			],
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var name = ctx.options.getString('name').trim().toLowerCase();
		var prop = ctx.options.getString('prop');
		var value = ctx.options.getString('value').trim();

		var color = await this.#stores.colors.get(ctx.user.id, name);
		if(!color) return "Color not found!";
		
		switch(prop) {
			case 'name':
				var existing = await this.#stores.colors.get(ctx.user.id, value.toLowerCase());
				if(existing && existing.id !== color.id) return "Saved color with that name already exists!";
				break;
			case 'color':
				var c = tc(value);
				if(!c.isValid()) return "That color isn't valid!";
				value = c.toHex()
				break;
		}

		await this.#stores.colors.update(ctx.user.id, name, {[prop]: value});
		return "Color updated!";
	}
}

module.exports = (bot, stores) => new Command(bot, stores);