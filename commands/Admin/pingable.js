module.exports = {
	help: ()=> "Set wether the roles that Sheep creates can be pinged or not. Defaults to false",
	usage: ()=> [" - Shows the current value",
				 " enable - Gives Sheep-managed roles the ability to be pinged by anyone",
				 " disable - Removes ability to ping Sheep-managed roles"],
	execute: async (bot, msg, args) => {
		var cfg = await bot.stores.configs.get(msg.guild.id);
		if(!cfg) cfg = {};
		return `Roles created by me currently ${cfg.pingable ? "can" : "can not"} be pinged by everyone automatically after creation!`;
	},
	alias: ['pingtoggle', 'ping', 'mention', 'mentionable'],
	subcommands: {},
	guildOnly: true
}

module.exports.subcommands.enable = {
	help: ()=> "Enable pingability for Sheep-managed roles",
	usage: ()=> [" - Enables the `everyone can mention this role` part of Sheep-managed roles"],
	execute: async (bot, msg, args) => {
		var roles = await bot.stores.userRoles.getAll(msg.guild.id);
		if(!roles || !roles[0]) return "No roles registered for this server!";

		var react = await msg.react("⌛");
		await msg.channel.createMessage("Editing roles... (This might take a bit!)");

		try {
			for(var i = 0; i < roles.length; i++) {
				if(!role.raw.mentionable) await role.raw.edit({mentionable: true})
			}
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
		
		react.users.remove(bot.user.id);
		try {
			await bot.stores.configs.update(msg.guild.id, {pingable: true});
		} catch(e) {
			return "ERR: "+e;
		}
		
		return "Config updated! Existing roles have also been made pingable";
	},
	alias: ["1", "y", "yes", "true"],
	permissions: ["MANAGE_ROLES"],
	guildOnly: true
}

module.exports.subcommands.disable = {
	help: ()=> "Disable pingability for Sheep-managed roles",
	usage: ()=> [" - Disables the `everyone can mention this role` part of Sheep-managed roles"],
	execute: async (bot, msg, args) => {
		var roles = await bot.stores.userRoles.getAll(msg.guild.id);
		if(!roles || !roles[0]) return "No roles registered for this server!";

		var react = await msg.react("⌛");
		await msg.channel.createMessage("Editing roles... (This might take a bit!)");

		try {
			for(var i = 0; i < roles.length; i++) {
				if(role.raw.mentionable) await role.raw.edit({mentionable: false})
			}
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
		
		react.users.remove(bot.user.id);
		try {
			await bot.stores.configs.update(msg.guild.id, {pingable: false});
		} catch(e) {
			return "ERR: "+e;
		}
		
		return "Config updated! Existing roles have also been made pingable";
	},
	alias: ["0", "n", "no", "false"],
	permissions: ["MANAGE_ROLES"],
	guildOnly: true
}