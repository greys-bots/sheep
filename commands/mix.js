module.exports = {
	help: ()=> "Mix two colors",
	usage: ()=> [" [color1] [color2] - Mixes two colors and gives the result. NOTE: currentl only accepts rgb/hsv values without spaces! eg: rgb(0,0,0)"],
	execute: async (bot, msg, args)=> {
		var col1 = bot.tc(args[0]);
		var col2 = bot.tc(args[1]);
		if(!col1.isValid() || !col2.isValid) return "One of those isn't a valid color :(";
		var c = await bot.utils.mixColors(bot, col1, col2);
		if(!c.isValid()) return "Something went wrong :(";
		
		await msg.channel.createMessage({embed: {
			title: "Color #"+c.toHex(),
			image: {
				url: `https://sheep.greysdawn.com/sheep/${c.toHex()}`
			},
			color: parseInt(c.toHex(), 16)
		}})
		return;
	},
	guildOnly: true,
	alias: ['m', 'blend']
}