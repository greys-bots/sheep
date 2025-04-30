const tc = require('tinycolor2');
const { Models: { SlashCommand } } = require('frame');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'mix',
			description: "Mix two colors",
			options: [
				{
					name: 'color1',
					description: "A color to mix",
					type: 3,
					required: true
				},
				{
					name: 'color2',
					description: "A second color to mix",
					type: 3,
					required: true
				},
				{
					name: 'amount',
					description: "The amount to mix the colors. 0-100, default: 50",
					type: 4,
					required: false
				}
			],
			usage: [
				'[color1] [color2] - Mix 2 colors at 50% strength',
				'[color1] [color2] [amount] - Mix two colors at a desired strength'
			],
			ephemeral: true,
			v2: true
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var c1 = tc(ctx.options.getString('color1'));
		var c2 = tc(ctx.options.getString('color2'));
		var amt = ctx.options.getInteger('amount');

		if(!c1.isValid() || !c2.isValid())
			return "Please provide two valid colors!";

		amt = amt ?? 50;
		if(amt < 0) amt = 0;
		if(amt > 100) amt = 100;

		var c3 = tc.mix(c1, c2, amt);

		return [{
			components: [{
				type: 17,
				accent_color: parseInt(c3.toHex(), 16),
				components: [
					{
						type: 10,
						content:
							`## Mixed colors\n` +
							`${c1.toString()} + ${c2.toString()} ` +
						 	`at ${amt}% strength = ${c3.toHexString().toUpperCase()}`
					},
					{
						type: 12,
						items: [{
							media: {url: `https://sheep.greysdawn.com/sheep/${c3.toHex()}`}
						}]
					}
				]
			}]
		}]
	}
}

module.exports = (bot, stores) => new Command(bot, stores);