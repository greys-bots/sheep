module.exports = {
	help: ()=> "Disables a command/module or a command's subcommands",
	usage: ()=> [" - Lists disabled commands",
				 " [command/module] <subcommand> - Disables given command or its subcommand"],
	execute: async (bot, msg, args) => {
		if(!args[0]) {
			var cfg = await bot.utils.getConfig(bot, msg.guild.id);
			if(!cfg || !cfg.disabled || (cfg.disabled && !cfg.disabled[0])) return "Nothing is disabled in this server";
			
			return {embed: {
				title: "Disabled Commands",
				description: cfg.disabled.commands.sort().join("\n")
			}}
		}
		if(["disable", "enable"].includes(args[0].toLowerCase())) return "You can't disable or enable this command.";
		var cfg = await bot.utils.getConfig(bot, msg.guild.id);
		var dis;
		if(!cfg) cfg = {dis: []}
		if(!cfg.disabled) dis = [];
		else dis = cfg.disabled;

		var cmd = args.join(" ").toLowerCase();
		if(bot.modules.get(bot.mod_aliases.get(cmd))) {
			var mod = bot.modules.get(bot.mod_aliases.get(cmd));
			console.log(mod.commands.map(c => c.name));
			dis = dis.concat(mod.commands.map(c => c.name));
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
			if(disabled) {
				return "That module is already disabled!";
			} else {
				dis.push(command.name)
				var success = await bot.utils.updateConfig(bot, msg.guild.id, {disabled: dis});
				if(success) {
					return "Disabled!";
				} else {
					return "Something went wrong :(";
				}
			}
		}
	},
	guildOnly: true,
	module: "admin",
	alias: ["dis","disabled"],
	permissions: ["MANAGE_GUILD"]
}