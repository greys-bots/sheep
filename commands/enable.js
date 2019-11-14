module.exports = {
	help: ()=> "Enables a command/module or a command's subcommands.",
	usage: ()=> [" [command/module] <subcommand> - enables given command or its subcommand"],
	execute: async (bot, msg, args) => {
		if(!args[0]) return "Please provide a command or module to enable.";
		if(args[0] == "disable" || args[0] == "enable") return "You can't disable or enable this command.";
		var cfg = await bot.utils.getConfig(bot, msg.guild.id);
		if(!cfg || !cfg.disabled) return "Nothing is disabled in this server.";
		var dis = cfg.disabled;
		var cmd;
		try {
			cmd = await bot.parseCommand(bot, msg, args);
		} catch (e) {
			cmd = undefined;
		}
		if(cmd) {
			var disabled = await bot.utils.isDisabled(bot, msg.guild.id, cmd[0], cmd[2]);
			if(!disabled) {
				return "Module already enabled."
			} else {
				dis = dis.filter(x => x != cmd[2]);
				var success = await bot.utils.updateConfig(bot, msg.guild.id, "disabled", dis);
				if(success) {
					return "Enabled!";
				} else {
					return "Something went wrong.";
				}
			}
		} else {
			return "Command not found"
		}
		
	},
	guildOnly: true,
	module: "admin",
	permissions: ["manageGuild"]
}