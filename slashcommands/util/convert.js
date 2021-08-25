const tc = require('tinycolor2');

module.exports = {
	data: {
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
		]
	},
	usage: [
		'[color] [format] - Convert a color to the desired format'
	],
	extra: "This command also accepts saved colors",
	async execute(ctx) {
		var color = ctx.options.getString('color').trim();
		var format = ctx.options.getString('format');

		var sv = await ctx.client.stores.colors.get(ctx.user.id, color.toLowerCase());
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
				embed.description += ctx.client.utils.toCmyk(color);
				break;
		}

		return {embeds: [embed]};
	},
	ephemeral: true
}