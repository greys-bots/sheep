module.exports = {
	help: ()=> "Toggle between user-based or server-based color roles",
	usage: ()=> [" - toggles the color role mode"],
	execute: async (bot, msg, args) => {
		var config = (await bot.stores.configs.get(msg.guild.id)) || {};
		var mode = Math.abs((config.role_mode || 0) - 1);
		if(isNaN(mode)) mode = 0;
		try {
			if(config) await bot.stores.configs.update(msg.guild.id, {role_mode: mode});
			else await bot.stores.configs.create(msg.guild.id, {role_mode: mode});
		} catch(e) {
			return "ERR:"+e;
		}

		return `Toggled! Current mode: ${mode == 1 ? "server-based colors" : "user-based colors"}`;
	},
	guildOnly: true,
	permissions: ["MANAGE_GUILD"],
	alias: ["tg"]
}