module.exports = {
	help: ()=> "Disables a command/module or a command's subcommands.",
	usage: ()=> [" [command/module] <subcommand> - disables given command or its subcommand",
				" view - lists disabled commands"],
	execute: async (bot, msg, args) => {
		if(!args[0]) return bot.commands.disable.subcommands.view.execute(bot, msg, args);
		if(args[0] == "disable" || args[0] == "enable") return "You can't disable or enable this command.";
		var cfg = await bot.utils.getConfig(bot, msg.guild.id);
		var dis;
		if(!cfg) cfg = {}
		if(!cfg.disabled) dis = [];
		else dis = cfg.disabled;
		console.log(dis)
		var cmd;
		try {
			cmd = await bot.parseCommand(bot, msg, args);
		} catch (e) {
			cmd = undefined;
		}
		if(cmd) {
			var disabled = await bot.utils.isDisabled(bot, msg.guild.id, cmd[0], cmd[2]);
			if(disabled) {
				return "Module already disabled.";
			} else {
				dis.push(cmd[2])
				var success = await bot.utils.updateConfig(bot, msg.guild.id, "disabled", dis);
				if(success) {
					return "Disabled!";
				} else {
					return "Something went wrong.";
				}
			}
		} else {
			return "Command not found";
		}
	},
	subcommands: {},
	guildOnly: true,
	module: "admin",
	alias: ["dis","disabled"],
	permissions: ["manageGuild"]
}

module.exports.subcommands.view = {
	help: ()=> "View currently disabled commands and modules.",
	usage: ()=> [" - Views the disabled config for the server"],
	execute: async (bot, msg, args) => {
		var cfg = await bot.utils.getConfig(bot, msg.guild.id);
		if(!cfg || !cfg.disabled || (cfg.disabled && !cfg.disabled.commands && !cfg.disabled.levels)) return msg.channel.createMessage('No config found for this server.')
		
		msg.channel.createMessage({embed: {
			title: "Disabled Functions",
			fields: [
				{name: "Commands", value: cfg.disabled.commands[0] ? cfg.disabled.commands.sort().join("\n") : "(none)"},
				{name: "Levels", value: cfg.disabled.levels ? "Yes" : "No"}
			]
		}})
	},
	guildOnly: true,
	permissions: ["manageGuild"]
}