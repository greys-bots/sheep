module.exports = {
	help: ()=> "Toggle between user-based or server-based color roles",
	usage: ()=> [" - toggles the color role mode"],
	execute: async (bot, msg, args, config = {role_mode: 0}) => {
		var mode = Math.abs(config.role_mode - 1);
		if(isNaN(mode)) mode = 0;
		try {
			await bot.stores.configs.update(msg.guild.id, {role_mode: mode});
		} catch(e) {
			return "ERR:"+e;
		}

		return `Toggled! Current mode: ${mode == 1 ? "server-based colors" : "user-based colors"}`;
	},
	guildOnly: true,
	permissions: ["MANAGE_GUILD"],
	alias: ["tg"]
}