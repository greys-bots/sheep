module.exports = {
	help: ()=> "Exports saved colors",
	usage: ()=> [" - Exports an archive of your saved colors",
				 " [color name] - "],
	execute: async (bot, msg, args) => {
		var colors = await bot.utils.getSavedColors(bot, msg.author.id);
		if(!colors || !colors[0]) return "You don't have any saved colors!";

		if(args[0]) colors = colors.filter(x => x.name == args[0].toLowerCase());
		if(!colors || !colors[0]) return "Color not found";

		return {content: "Here's your file!", files: [{attachment: Buffer.from(JSON.stringify(colors.map(c => { return {name: c.name, color: c.color} }))), name: "saved_colors.json"}]};
	}
}