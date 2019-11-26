module.exports = {
	help: ()=> "Set wether the roles that Sheep creates can be pinged or not. Defaults to false",
	usage: ()=> [" - Shows the current value",
				 " enable - Gives Sheep-managed roles the ability to be pinged by anyone",
				 " disable - Removes ability to ping Sheep-managed roles"],
	execute: async (bot, msg, args, config = {pingable: false}) => {
		return `Roles created by me currently can${config.pingable ? "" : " not"} be pinged automatically after creation.`;
	},
	alias: ['pingtoggle', 'ping', 'mention', 'mentionable'],
	subcommands: {},
	guildOnly: true
}

module.exports.subcommands.enable = {
	help: ()=> "Enable pingability for Sheep-managed roles",
	usage: ()=> [" - Enables the `everyone can mention this role` part of Sheep-managed roles"],
	execute: async (bot, msg, args) => {
		await msg.channel.createMessage("Editing roles... (This might take a bit!)")
		var roles = await bot.utils.getManagedRoles(bot, msg.guild.id);

		try {
			await Promise.all(roles.map(r => {
				var role = msg.guild.roles.find(rl => rl.id == r);
				if(role && !role.mentionable) return bot.editRole(msg.guild.id, role.id, {mentionable: true})
			}));
		} catch(e) {
			console.log(e);
			return [
				"There was an error! D:",
				"```",
				e.message,
				"```",
				"Some roles may not have been edited, and the config will stay the same"
			].join("\n")
		}
		

		var scc = await bot.utils.updateConfig(bot, msg.guild.id, "pingable", true);
		if(scc) return "Config updated!";
		else return "Something went wrong when updating the config :("
	},
	alias: ["1", "y", "yes", "true"],
	permissions: ["mangeRoles"],
	guildOnly: true
}

module.exports.subcommands.enable = {
	help: ()=> "Disable pingability for Sheep-managed roles",
	usage: ()=> [" - Disables the `everyone can mention this role` part of Sheep-managed roles"],
	execute: async (bot, msg, args) => {
		await msg.channel.createMessage("Editing roles... (This might take a bit!)")
		var roles = await bot.utils.getManagedRoles(bot, msg.guild.id);

		try {
			await Promise.all(roles.map(r => {
				var role = msg.guild.roles.find(rl => rl.id == r);
				if(role && role.mentionable) return bot.editRole(msg.guild.id, role.id, {mentionable: false})
			}));
		} catch(e) {
			console.log(e);
			return [
				"There was an error! D:",
				"```",
				e.message,
				"```",
				"Some roles may not have been edited, and the config will stay the same"
			].join("\n")
		}
		

		var scc = await bot.utils.updateConfig(bot, msg.guild.id, "pingable", true);
		if(scc) return "Config updated!";
		else return "Something went wrong when updating the config :("
	},
	alias: ["0", "n", "no", "false"],
	permissions: ["mangeRoles"],
	guildOnly: true
}