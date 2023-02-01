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
				required: false
			}],
			usage: [
				'- View all saved colors',
				"[color] - View a specific saved color"
			],
			ephemeral: true
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

			return {embeds: [{
				title: `Color ${c.toHexString().toUpperCase()}`,
				image: { url: `https://sheep.greysdawn.com/sheep/${c.toHex()}` },
				color: parseInt(c.toHex(), 16)
			}]}
		}

		var embeds = await this.#bot.utils.genEmbeds(this.#bot, colors, c => {
			var cl = tc(c.color);
			return {
				name: c.name,
				value: cl.toHexString()
			}
		}, {
			title: 'Saved Colors'
		})

		return embeds.map(e => e.embed);
	}
}

module.exports = (bot, stores) => new Command(bot, stores);