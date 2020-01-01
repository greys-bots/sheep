module.exports = {
	help: ()=> "Show your current color",
	usage: ()=> [" - Tells you what your current color is"],
	execute: async (bot, msg, args) => {
		var role = await bot.utils.getRawUserRole(bot, msg.guild, msg.member);
		if(!role) return "Either you don't have a color role or I couldn't get it :(";

		var color = bot.tc(role.color.toString(16));
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