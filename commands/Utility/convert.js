module.exports = {
	help: ()=> "Converts a color to a new form",
	usage: ()=> [" [color] [hex|rgb|hsv|cmyk] - Converts color to the given form. NOTE: cannot convert to color names"],
	execute: async (bot, msg, args) => {
		if(args.length < 2) return 'Please provide a color and a form to convert to';
		var name = args.slice(0, args.length - 1).join('').toLowerCase();
		var color = await bot.stores.colors.get(msg.author.id, name);
		if(color) bot.tc(color.color);
		else color = bot.tc(name);
		var form = args.slice(-1).toLowerCase();
		if(!color.isValid()) return "That color isn't valid :(";

		switch(form) {
			case 'hex':
				return {
					description: `${color.toString()} = ${color.toHexString().toUpperCase()}`,
					color: parseInt(color.toHex(), 16)
				}
				return;
				break;
			case 'rgb':
				return {
					description: `${color.toString()} = ${color.toRgbString().toUpperCase()}`,
					color: parseInt(color.toHex(), 16)
				}
				return;
				break;
			case 'hsv':
				return {
					description: `${color.toString()} = ${color.toHsvString().toUpperCase()}`,
					color: parseInt(color.toHex(), 16)
				}
				break;
			case 'cmyk':
				var cmyk = await bot.utils.toCmyk(color);
				return {
					description: `${color.toString()} = CMYK(${cmyk.c}, ${cmyk.m}, ${cmyk.y}, ${cmyk.k})`,
					color: parseInt(color.toHex(), 16)
				}
				break;
			default:
				return "I can't convert to that form :(";
				break;
		}
		
	},
	alias: ['cc', 'conv', 'cv', 'convertcolor']
}