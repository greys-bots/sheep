module.exports = {
	help: ()=> "Show your current color",
	usage: ()=> [" - Tells you what your current color is"],
	execute: async (bot, msg, args) => {
		var role = await bot.stores.userRoles.get(msg.guild.id, msg.member.id);
		if(!role) return "Either you don't have a color role or I couldn't get it :(";
		if(!role.raw?.color) return "Your role has no color!";

		var conv = role.raw.color.toString(16);
		if(conv.length < 6) while(conv.length < 6) conv = "0"+conv; //number padding
		var color = bot.tc(conv);

		return {
			embed: {
				title: "Current color: "+color.toHexString().toUpperCase(),
				image: {
					url: `https://sheep.greysdawn.com/sheep/${color.toHex()}`
				},
				color: parseInt(color.toHex(), 16),
				footer: {
					text: `${color.toRgbString()}`
				}
			}
		}
	},
	guildOnly: true,
	alias: ["cr", "cur", "curr"]
}