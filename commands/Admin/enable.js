module.exports = {
	help: ()=> "Enables a command/module or a command's subcommands",
	usage: ()=> [" [command/module] <subcommand> - enables given command or its subcommand"],
	execute: async (bot, msg, args) => {
		if(!args[0]) return "Please provide a command or module to enable";
		if(args[0] == "disable" || args[0] == "enable") return "You can't disable or enable this command!";
		var cfg = await bot.stores.configs.get(msg.guild.id);
		if(!cfg || !cfg.disabled || !cfg.disabled[0]) return "Nothing is disabled in this server!";
		var dis = cfg.disabled;

		var cmd = args.join(" ").toLowerCase();
		if(bot.modules.get(bot.mod_aliases.get(cmd))) {
			var mod = bot.modules.get(bot.mod_aliases.get(cmd));
			dis = dis.filter(x => !mod.commands.get(x));
			try {
				await bot.stores.configs.update(msg.guild.id, {disabled: dis});
			} catch(e) {
				return "ERR: "+e;
			}

			return "Module enabled!";
		} else {
			try {
				var {command} = await bot.handlers.command.parse(args);
			} catch (e) {
				command = undefined;
			}
			if(!command) return "Command/module not found";
			
			if(!dis.includes(command.name)) {
				return "That command is already enabled!"
			} else {
				dis = dis.filter(x => x != command.name);
				try {
					await bot.stores.configs.update(msg.guild.id, {disabled: dis});
				} catch(e) {
					return "ERR: "+e;
				}

				if(dis.includes(command.name.split(" ")[0]))
					return "Subcommand enabled, but the overall command is still disabled; enable the overall command to use this one";
				else return "Command enabled!";
			}
		}
	},
	guildOnly: true,
	module: "admin",
	permissions: ["MANAGE_GUILD"]
}