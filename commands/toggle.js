module.exports = {
	help: ()=> "Toggle between user-based or server-based color roles",
	usage: ()=> [" - toggles the color role mode"],
	execute: async (bot, msg, args, config = {role_mode: 0}) => {
		var mode = Math.abs(config.role_mode - 1);
		var success = await bot.utils.updateConfig(bot, msg.guild.id, mode);
		if(success) return `Toggled! Current mode: ${mode == 1 ? "server-based colors" : "user-based colors"}`;
		else return "Something went wrong :("
	},
	guildOnly: true,
	permissions: ["manageRoles"]
}