module.exports = {
	help: ()=> "Enables a command/module or a command's subcommands.",
	usage: ()=> [" [command/module] <subcommand> - enables given command or its subcommand"],
	execute: async (bot, msg, args) => {
		if(!args[0]) return "Please provide a command or module to enable.";
		if(args[0] == "disable" || args[0] == "enable") return "You can't disable or enable this command.";
		var cfg = await bot.utils.getConfig(bot, msg.guild.id);
		if(!cfg || !cfg.disabled || (cfg.disabled && !cfg.disabled[0])) return "Nothing is disabled in this server!";
		var dis = cfg.disabled;

		var cmd = args.join(" ").toLowerCase();
		if(bot.modules.get(bot.mod_aliases.get(cmd))) {
			var mod = bot.modules.get(bot.mod_aliases.get(cmd));
			dis = dis.filter(x => !mod.commands.get(x));
			var success = await bot.utils.updateConfig(bot, msg.guild.id, {disabled: dis});
			if(success) return "Disabled!";
			else "Something went wrong";
		} else {
			try {
				var {command} = await bot.parseCommand(bot, msg, args);
			} catch (e) {
				command = undefined;
			}
			if(!command) return "Command/module not found";
			
			var disabled = await bot.utils.isDisabled(bot, msg.guild.id, command, command.name);
			if(!disabled) {
				return "That command is already enabled!"
			} else {
				dis = dis.filter(x => x != command.name);
				var success = await bot.utils.updateConfig(bot, msg.guild.id, {disabled: dis});
				if(success) {
					return "Enabled!";
				} else {
					return "Something went wrong :(";
				}
			}
		}
	},
	guildOnly: true,
	module: "admin",
	permissions: ["MANAGE_GUILD"]
}