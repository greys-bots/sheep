module.exports = {
	help: ()=> "Converts a color to a new form",
	usage: ()=> [" [color] [hex|rgb|hsv|cmyk] - Converts color to the given form. NOTE: cannot convert to color names"],
	execute: async (bot, msg, args) => {
		if(args.length < 2) return 'Please provide a color and a form to convert to';
		var color = bot.tc(args.slice(0, args.length - 1).join(''));
		var form = args.slice(-1).join('').toLowerCase();
		if(!color.isValid()) return "That color isn't valid :(";
		var message;

		switch(form) {
			case 'hex':
				message = {embed: {
					description: `${color.toString()} = ${color.toHexString().toUpperCase()}`,
					color: parseInt(color.toHex(), 16)
				}}
				return;
				break;
			case 'rgb':
				message = {embed: {
					description: `${color.toString()} = ${color.toRgbString().toUpperCase()}`,
					color: parseInt(color.toHex(), 16)
				}}
				return;
				break;
			case 'hsv':
				message = {embed: {
					description: `${color.toString()} = ${color.toHsvString().toUpperCase()}`,
					color: parseInt(color.toHex(), 16)
				}}
				break;
			case 'cmyk':
				var cmyk = await bot.utils.toCmyk(color);
				message = {embed: {
					description: `${color.toString()} = CMYK(${cmyk.c}, ${cmyk.m}, ${cmyk.y}, ${cmyk.k})`,
					color: parseInt(color.toHex(), 16)
				}}
				break;
			default:
				message = "I can't convert to that form :(";
				break;
		}
		
		msg.channel.send(message);
	},
	alias: ['cc', 'conv', 'cv', 'convertcolor']
}