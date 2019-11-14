module.exports = {
	help: ()=> "Enables a command/module or a command's subcommands.",
	usage: ()=> [" [command/module] <subcommand> - enables given command or its subcommand"],
	execute: async (bot, msg, args) => {
		if(!args[0]) return msg.channel.createMessage("Please provide a command or module to enable.");
		if(args[0] == "disable" || args[0] == "enable") return msg.channel.createMessage("You can't disable or enable this command.");
		var cfg = await bot.utils.getConfig(bot, msg.guild.id);
		if(!cfg) return msg.guild.createMessage("No config registered for this server.");
		if(!cfg.disabled) return msg.guild.createMessage("Nothing is disabled in this server.");
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
				return msg.channel.createMessage("Module already enabled.")
			} else {
				dis.commands = dis.commands.filter(x => x != cmd[2]);
				var success = await bot.utils.updateConfig(bot, msg.guild.id, "disabled", dis);
				if(success) {
					msg.channel.createMessage("Enabled!")
				} else {
					msg.channel.createMessage("Something went wrong.");
				}
			}
		} else {
			cmd = args[0].toLowerCase()
			if(["levels", "levelup", "levelups"].includes(cmd)) {
				dis.levels = false;

				var success = await bot.utils.updateConfig(bot, msg.guild.id, "disabled", dis);
				if(success) {
					msg.channel.createMessage("Enabled!")
				} else {
					msg.channel.createMessage("Something went wrong.");
				}
			} else if(bot.modules[cmd]) {
				var cmds = Object.keys(bot.commands).filter(c => bot.commands[c].module && bot.commands[c].module == cmd);
				dis.commands = dis.commands.filter(x => !cmds.includes(x));
				var success = await bot.utils.updateConfig(bot, msg.guild.id, "disabled", dis);
				if(success) {
					msg.channel.createMessage("Enabled!")
				} else {
					msg.channel.createMessage("Something went wrong.");
				}
			} else {
				return msg.channel.createMessage("Could not enable: "+e);
			}
		}
		
	},
	guildOnly: true,
	module: "admin",
	permissions: ["manageGuild"]
}