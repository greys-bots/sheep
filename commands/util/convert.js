const tc = require('tinycolor2');
const { Models: { SlashCommand } } = require('frame');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'convert',
			description: 'Convert a color into another format',
			options: [
				{
					name: 'color',
					description: "The color to convert",
					type: 3,
					required: true
				},
				{
					name: 'format',
					description: "The format to convert the color to",
					type: 3,
					required: true,
					choices: [
						{
							name: "hex",
							value: "hex"
						},
						{
							name: "rgb",
							value: "rgb"
						},
						{
							name: "hsv",
							value: "hsv"
						},
						{
							name: "cmyk",
							value: "cmyk"
						},
					]
				}
			],
			usage: [
				'[color] [format] - Convert a color to the desired format'
			],
			extra: "This command also accepts saved colors",
			ephemeral: true
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var color = ctx.options.getString('color').trim();
		var format = ctx.options.getString('format');

		var sv = await this.#stores.colors.get(ctx.user.id, color.toLowerCase());
		if(sv) color = tc(sv.color);
		else color = tc(color);

		if(!color.isValid()) return "Please provide a valid color!";

		var embed = {
			title: "Color Conversion",
			description: `${color.toString()} = `,
			color: parseInt(color.toHex(), 16),
			footer: {text: `Converted to: ${format}`}
		}
		
		switch(format) {
			case 'hex':
				embed.description += color.toHexString().toUpperCase();
				break;
			case 'rgb':
				embed.description += color.toRgbString();
				break;
			case 'hsv':
				embed.description += color.toHsvString();
				break;
			case 'cmyk':
				embed.description += this.#bot.utils.toCmyk(color);
				break;
		}

		return {embeds: [embed]};
	}
}

module.exports = (bot, stores) => new Command(bot, stores);