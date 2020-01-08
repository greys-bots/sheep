module.exports = {
	help: ()=> "Disables a command/module or a command's subcommands",
	usage: ()=> [" [command/module] <subcommand> - Disables given command or its subcommand",
				" list - Lists disabled commands"],
	execute: async (bot, msg, args) => {
		if(!args[0]) return bot.commands.disable.subcommands.view.execute(bot, msg, args);
		if(args[0] == "disable" || args[0] == "enable") return "You can't disable or enable this command.";
		var cfg = await bot.utils.getConfig(bot, msg.guild.id);
		var dis;
		if(!cfg) cfg = {dis: []}
		if(!cfg.disabled) dis = [];
		else dis = cfg.disabled;
		var cmd;
		try {
			cmd = await bot.parseCommand(bot, msg, args);
		} catch (e) {
			cmd = undefined;
		}
		if(cmd) {
			var disabled = await bot.utils.isDisabled(bot, msg.guild.id, cmd[0], cmd[2]);
			if(disabled) {
				return "That module is already disabled!";
			} else {
				dis.push(cmd[2])
				var success = await bot.utils.updateConfig(bot, msg.guild.id, {disabled: dis});
				if(success) {
					return "Disabled!";
				} else {
					return "Something went wrong :(";
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
	permissions: ["MANAGE_GUILD"]
}

module.exports.subcommands.list = {
	help: ()=> "View currently disabled commands and modules.",
	usage: ()=> [" - Views the disabled config for the server"],
	execute: async (bot, msg, args) => {
		var cfg = await bot.utils.getConfig(bot, msg.guild.id);
		if(!cfg || !cfg.disabled) return 'Nothing is disabled for this server!'
		
		msg.channel.createMessage({embed: {
			title: "Disabled Functions",
			fields: [
				{name: "Commands", value: cfg.disabled[0] ? cfg.disabled.sort().join("\n") : "(none)"}
			]
		}})
	},
	alias: ["view"],
	guildOnly: true,
	permissions: ["MANAGE_GUILD"]
}