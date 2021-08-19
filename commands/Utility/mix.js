module.exports = {
	help: ()=> "Mix two colors",
	usage: ()=> [" [color1] [color2] - Mixes two colors and gives the result. NOTE: currentl only accepts rgb/hsv values without spaces! eg: rgb(0,0,0)"],
	execute: async (bot, msg, args)=> {
		var col1 = await bot.stores.colors.get(msg.author.id, args[0].toLowerCase());
		if(col1) col1 = bot.tc(col1.color);
		else col1 = bot.tc(args[0]);
		
		var col2 = await bot.stores.colors.get(msg.author.id, args[1].toLowerCase());
		if(col2) col2 = bot.tc(col1.color);
		else col2 = bot.tc(args[1]);

		if(!col1.isValid()) return "The first color isn't valid :(";
		if(!col2.isValid()) return "The second color isn't valid :(";
		var c = await bot.utils.mixColors(bot, col1, col2);
		if(!c.isValid()) return "Something went wrong :(";
		
		return {
			title: "Color #"+c.toHex(),
			image: {
				url: `https://sheep.greysdawn.com/sheep/${c.toHex()}`
			},
			color: parseInt(c.toHex(), 16)
		}
	},
	guildOnly: true,
	alias: ['m', 'blend']
}