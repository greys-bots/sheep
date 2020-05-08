module.exports = {
	help: ()=> "Whitelists bot usage to specific users/roles",
	usage: ()=> [" - Lists users/roles that have been whitelisted",
				 " add [user/role] ... - Adds users/roles to the whitelist",
				 " remove [user/role] ... - Removes users/roles from the whitelist",
				 " clear - Clears the whitelist",
				 " on - Turns on the whitelist. Turns off the blacklist if it's active",
				 " off - Turns off the whitelist, but preserves the data there"],
	desc: ()=> "NOTE: Mods (aka those permission to `MANAGE_MESSAGES`) will still be able to use the bot no matter what",
	execute: async (bot, msg, args) => {
		var config = await bot.stores.usages.get(msg.guild.id);
		if(!config) return "No config registered!";
		if(config.type == 2) return "Config set to blacklist mode!";
		if(!config.whitelist) return "Nothing registered for your whitelist!";

		var roles = [];
		var users = [];
		for(var item of config.whitelist) {
			var role = msg.guild.roles.cache.find(r => r.id == item);
			var user = bot.users.cache.find(u => u.id == item);
			if(role) roles.push(role.toString());
			else if(user) users.push(user.toString());
		}

		return {embed: {
			title: "Whitelist",
			description: "Users and roles that can use this bot",
			fields: [
				{name: "Roles", value: roles.join("\n") || "none"},
				{name: "Users", value: users.join("\n") || "none"}
			]
		}}
	},
	permissions: ["MANAGE_GUILD"],
	alias: ["wl"],
	guildOnly: true,
	subcommands: {}
}

module.exports.subcommands.add = {
	help: ()=> "Adds users/roles to the whitelist",
	usage: ()=> [" [user/role] ... - Adds the given user(s)/role(s) to the whitelist"],
	execute: async (bot, msg, args) => {
		var config = await bot.stores.usages.get(msg.guild.id);
		if(config && [0, 2].includes(config.type)) return "The whitelist is disabled and can't be edited!";

		var whitelist = [];
		if(config && config.whitelist) whitelist = config.whitelist;
		var added = [];
		var invalid = [];

		for(var arg of args) {
			arg = arg.replace(/[<@!&>]/g, "");
			var role = msg.guild.roles.cache.find(r => r.id == arg || r.name.toLowerCase() == arg.toLowerCase());
			var user = bot.users.cache.find(u => u.id == arg);
			if((role || user) && !whitelist.includes(arg)) added.push(role || user);
			else invalid.push(arg);
		}

		whitelist = whitelist.concat(added.map(x => x.id));

		try {
			if(config) bot.stores.usages.update(msg.guild.id, {whitelist});
			else bot.stores.usages.create(msg.guild.id, {whitelist, type: 1});
		} catch(e) {
			return "ERR: "+e;
		}

		return {embed: {
			title: "Whitelisted",
			fields: [
				{name: "Added", value: added[0] ? added.map(x => x.toString()).join("\n") : "none"},
				{name: "Not added", value: invalid[0] ? invalid.join("\n") : "none"}
			]
		}}
	},
	alias: ["a", "+"]
}

module.exports.subcommands.remove = {
	help: ()=> "Removes users/roles from the whitelist",
	usage: ()=> [" [user/role] ... - Removes the given user(s)/role(s) from the whitelist"],
	execute: async (bot, msg, args) => {
		var config = await bot.stores.usages.get(msg.guild.id);
		if(!config || !config.whitelist[0]) return "Nothing to remove!";
		if(config && [0, 2].includes(config.type)) return "The whitelist is disabled and can't be edited!";

		var whitelist = config.whitelist;
		var removed = [];
		var invalid = [];

		for(var arg of args) {
			arg = arg.replace(/[<@!&>]/g, "");
			var role = msg.guild.roles.cache.find(r => r.id == arg || r.name.toLowerCase() == arg.toLowerCase());
			var user = bot.users.cache.find(u => u.id == arg);
			if((role || user) && whitelist.includes(arg)) {
				whitelist = whitelist.filter(x => ![role.id, user.id].includes(x));
				removed.push(role || user);
			} else invalid.push(arg);
		}

		try {
			bot.stores.usages.update(msg.guild.id, {whitelist});
		} catch(e) {
			return "ERR: "+e;
		}

		return {embed: {
			title: "Whitelisted",
			fields: [
				{name: "Removed", value: removed[0] ? removed.map(x => x.toString()).join("\n") : "none"},
				{name: "Not removed", value: invalid[0] ? invalid.join("\n") : "none"}
			]
		}}
	},
	alias: ["r", "rmv", "-"]
}

module.exports.subcommands.clear = {
	help: ()=> "Clears the whitelist",
	usage: ()=> [" - Clears everything from the whitelist"],
	execute: async (bot, msg, args) => {
		var config = await bot.stores.usages.get(msg.guild.id);
		if(!config || !config.whitelist[0]) return "Nothing to clear!";
		if(config && [0, 2].includes(config.type)) return "The whitelist is disabled and can't be edited!";
		
		var message = await msg.channel.send("Are you sure you want to clear everything from the whitelist?");
		["✅","❌"].forEach(r => message.react(r));

		var reaction = await message.awaitReactions((r, u) => ["✅","❌"].includes(r.emoji.name) && u.id == msg.author.id, {time: 30000, max: 1});
		reaction = reaction.first();
		if(!reaction) return "ERR: timed out!";
		if(reaction.emoji.name == "❌") return "Action cancelled!";

		try {
			bot.stores.usages.update(msg.guild.id, {whitelist: []});
		} catch(e) {
			return "ERR: "+e;
		}

		return "Whitelist cleared!";
	},
	alias: ["reset"]
}

module.exports.subcommands.on = {
	help: ()=> "Turn the whitelist on",
	usage: ()=> [" - Enables the whitelist"],
	execute: async (bot, msg, args) => {
		var config = await bot.stores.usages.get(msg.guild.id);
		if(config && config.type == 2) {
			var message = await msg.channel.send("Blacklist is already turned on! Turn on the whitelist instead?");
			["✅","❌"].forEach(r => message.react(r));

			var reaction = await message.awaitReactions((r, u) => ["✅","❌"].includes(r.emoji.name) && u.id == msg.author.id, {time: 30000, max: 1});
			reaction = reaction.first();
			if(!reaction) return "ERR: timed out!";
			if(reaction.emoji.name == "❌") return "Action cancelled!";
		}

		try {
			bot.stores.usages.update(msg.guild.id, {type: 1});
		} catch(e) {
			return "ERR: "+e;
		}

		return "Whitelist enabled!";
	},
	alias: ["enable"]
}

module.exports.subcommands.off = {
	help: ()=> "Turn the whitelist off",
	usage: ()=> [" - Disables the whitelist"],
	execute: async (bot, msg, args) => {
		var config = await bot.stores.usages.get(msg.guild.id);
		if(config && [0, 2].includes(config.type)) return "The whitelist is already disabled!";

		try {
			bot.stores.usages.update(msg.guild.id, {type: 0});
		} catch(e) {
			return "ERR: "+e;
		}

		return "Whitelist disabled!";
	},
	alias: ["disable"]
}