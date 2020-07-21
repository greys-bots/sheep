module.exports = {
	help: ()=> "Disables a command/module or a command's subcommands",
	usage: ()=> [" - Lists disabled commands",
				 " [command/module] <subcommand> - Disables given command or its subcommand"],
	execute: async (bot, msg, args) => {
		var cfg = await bot.stores.configs.get(msg.guild.id);
		if(!args[0]) {
			if(!cfg || !cfg.disabled || !cfg.disabled[0]) return "Nothing is disabled in this server";
			
			return {embed: {
				title: "Disabled Commands",
				description: cfg.disabled.commands.sort().join("\n")
			}}
		}
		if(["disable", "enable"].includes(args[0].toLowerCase())) return "You can't disable or enable this command.";
		var dis;
		if(!cfg || !cfg.disabled) dis = [];
		else dis = cfg.disabled;

		var cmd = args.join(" ").toLowerCase();
		if(bot.modules.get(bot.mod_aliases.get(cmd))) {
			var mod = bot.modules.get(bot.mod_aliases.get(cmd));
			dis = dis.concat(mod.commands.map(c => c.name));
			try {
				await bot.stores.configs.update(msg.guild.id, {disabled: dis});
			} catch(e) {
				return "ERR: "+e;
			}
			
			return "Module disabled!";
		} else {
			try {
				var {command} = await bot.parseCommand(bot, msg, args);
			} catch (e) {
				command = undefined;
			}
			if(!command) return "Command/module not found";

			if(dis.includes(command.name)) {
				return "That command is already disabled!";
			} else {
				dis.push(command.name)
				try {
					await bot.stores.configs.update(msg.guild.id, {disabled: dis});
				} catch(e) {
					return "ERR: "+e;
				}
				
				return "Command disabled!";
			}
		}
	},
	guildOnly: true,
	module: "admin",
	alias: ["dis","disabled"],
	permissions: ["MANAGE_GUILD"]
}