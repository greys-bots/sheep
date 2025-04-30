const tc = require('tinycolor2');
const { Models: { SlashCommand } } = require('frame');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'view',
			description: "View your saved colors",
			options: [{
				name: 'color',
				description: "A specific color to view",
				type: 3,
				required: false,
				autocomplete: true
			}],
			usage: [
				'- View all saved colors',
				"[color] - View a specific saved color"
			],
			ephemeral: true,
			v2: true
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var color = ctx.options.getString('color', false)?.trim().toLowerCase();
		var colors = await this.#stores.colors.getAll(ctx.user.id);
		if(!colors?.[0]) return "No colors saved!";

		if(color) {
			var c = colors.find(cl => cl.name.toLowerCase() == color);
			if(!c) return "Color not found!";
			c = tc(c.color);

			return [{
				components: [{
					type: 17,
					accent_color: parseInt(c.toHex(), 16),
					components: [
						{
							type: 10,
							content: `## Color ${c.toHexString().toUpperCase()}`
						},
						{
							type: 12,
							items: [{
								media: { url: `https://sheep.greysdawn.com/sheep/${c.toHex()}` }
							}]
						}
					]
				}]
			}];
		}

		var comps = this.#bot.utils.genComps(colors, (c) => {
			var cl = tc(c.color);
			return {
				type: 9,
				components: [{
					type: 10,
					content: `**${c.name}**\n${cl.toHexString()}`
				}],
				accessory: {
					type: 11,
					media: {
						url: `https://sheep.greysdawn.com/color/${cl.toHex()}?text=%20`
					}
				}
			}
		})

		var embeds = comps.map(c => {
			return {
				components: [
					{
						type: 17,
						components: [
							{
								type: 10,
								content: '## Saved Colors'
							},
							...c
						]
					}
				]
			}
		})
		console.log(embeds);

		return embeds;
	}

	async auto(ctx) {
		var colors = await this.#stores.colors.getAll(ctx.user.id);
		var foc = ctx.options.getFocused();
		if(!foc) return colors.map(c => ({ name: c.name, value: c.name }));
		foc = foc.toLowerCase()

		if(!colors?.length) return [];

		return colors.filter(c =>
			c.color.includes(foc) ||
			c.name.toLowerCase().includes(foc)
		).map(c => ({
			name: c.name,
			value: c.name
		}))
	}
}

module.exports = (bot, stores) => new Command(bot, stores);