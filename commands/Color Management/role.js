module.exports = {
	help: ()=> "Lists all server-based color roles",
	usage: ()=> [" - Lists currently indexed roles",
				 " create [name] [color] - Creates new color role and indexes it",
				 " edit [color|name] [name] [value] - Edits an indexed role. Can change the role's color or name",
				 " reset - Deletes all indexed color roles and switches to user-based roles"],
	execute: async (bot, msg, args, config = {role_mode: 0}) => {
		var roles = await bot.stores.serverRoles.getAll(msg.guild.id);
		console.log(roles);
		if(!roles || !roles[0]) return "No indexed roles";
		
		var embeds = await bot.utils.genEmbeds(bot, roles.filter(x => x.name != "invalid"), (r) => {
			return {name: r.raw.name, value: `#${r.raw.color ? r.raw.color.toString(16).toUpperCase() : "(no color)"}`}
		}, {
			title: "Server Color Roles",
			description: "name : color"
		},10);

		return embeds;
	},
	guildOnly: true,
	subcommands: {},
	alias: ["rl", "roles", "rls"]
}

module.exports.subcommands.create = {
	help: ()=> "Adds a new server-based color role (NOTE: will create a new role)",
	usage: ()=> [" [role name] [color] - Creates a role with the given name and color"],
	execute: async (bot, msg, args, config = {role_mode: 0}) => {
		if(config.role_mode == 0) return "Current mode set to user-based roles; can't add new server-based ones! Use `s!tg` to toggle modes";
		var color = bot.tc(args[args.length-1]);
		if(!color.isValid()) return "That is not a valid color";

		var role;

		try {
			role = await msg.guild.roles.create({data: {name: args.slice(0, args.length - 1).join(" "), color: color.toHex()}});
			await bot.stores.serverRoles.create(msg.guild.id, role.id);
		} catch(e) {
			console.log(e);
			return "ERR: "+(e.message || e)
		}

		return "Role created!";
	},
	guildOnly: true,
	permissions: ["MANAGE_ROLES"],
	alias: ['new', '+', 'cr', 'n']
}

module.exports.subcommands.index = {
	help: ()=> "Indexes a server-based color role based on an existing one",
	usage: ()=> [" [role] - Indexes the given role. Role can be the @mention, role name, or ID."],
	execute: async (bot, msg, args, config = {role_mode: 0}) => {
		if(config.role_mode == 0) return "Current mode set to user-based roles; can't add new server-based ones! Use `s!tg` to toggle modes";
		var role = await msg.guild.roles.cache.find(r => r.name == args.join(" ").toLowerCase() || r.id == args[0].replace(/[<@&>]/g,""));
		if(!role) return "Couldn't find that role.";
		var color = bot.tc(role.color.toString(16));
		if(!color.isValid()) return "That role doesn't have a valid color, so I can't index it :(";
		var exists = await bot.stores.serverRoles.get(msg.guild.id, role.id);
		if(exists) return "Role already indexed!";

		try {
			await bot.stores.serverRoles.create(msg.guild.id, role.id);
		} catch(e) {
			return "ERR: "+e;
		}

		return "Role indexed!";
	},
	guildOnly: true,
	permissions: ["MANAGE_ROLES"],
	alias: ['ind']
}

module.exports.subcommands.remove = {
	help: ()=> "Removes a server-based color role based",
	usage: ()=> [" [role] - Removes the given role. Role can be the @mention, role name, or ID."],
	execute: async (bot, msg, args, config = {role_mode: 0}) => {
		if(config.role_mode == 0) return "Current mode set to user-based roles; can't edit server-based ones! Use `s!tg` to toggle modes";
		var role = await msg.guild.roles.cache.find(r => r.name == args.join(" ").toLowerCase() || r.id == args[0].replace(/[<@&>]/g,""));
		if(!role) return "Couldn't find that role :(";
		console.log(role.id);
		var exists = await bot.stores.serverRoles.get(msg.guild.id, role.id);
		console.log(exists);
		if(!exists) return "Role not indexed!";

		try {
			await bot.stores.serverRoles.delete(msg.guild.id, role.id);
		} catch(e) {
			return "ERR: "+e;
		}

		return "Role removed!";
	},
	guildOnly: true,
	permissions: ["MANAGE_ROLES"],
	alias: ['ind']
}

module.exports.subcommands.edit = {
	help: ()=> "Edit an indexed color role",
	usage: ()=> [" name [old name] (new line) [new name] - Changes a role's name. Put the new name on a new line!",
				 " color [name] [color] - Changes a role's color. This doesn't need a new line"],
	execute: async (bot, msg, args, config = {role_mode: 0}) => {
		if(config.role_mode == 0) return "Current mode set to user-based roles; can't edit server-based ones! Use `s!tg` to toggle modes";
		if(!args[0]) return "Please provide what to edit (`role` or `color`), as well as the role name and new value\nExample: `s!rl edit color test role #ffcc00`";
		var data = {};
		switch(args[0].toLowerCase()) {
			case "name":
				var newArgs = args.slice(1).join(" ").split("\n");
				if(!newArgs[1]) return "This command requires the new role name to be on a new line!";
				var role = msg.guild.roles.cache.find(r => r.name == newArgs[0]);
				if(!role) return "Role not found";
				data = {name: newArgs[1]};
				break;
			case "color":
				var role = msg.guild.roles.cache.find(r => r.name == args.slice(1, args.length-1).join(" "));
				if(!role) return "Role not found";
				var color = bot.tc(args[args.length-1]);
				if(!color.isValid()) return "Invalid color :("
				data = {color: parseInt(color.toHex(), 16)};
				break;
		}

		try {
			await role.edit(data);
		} catch(e) {
			console.log(e);
			return "ERR: "+e.message;
		}
		return "Updated!"
	},
	guildOnly: true,
	permissions: ['MANAGE_ROLES']
}

module.exports.subcommands.reset = {
	help: ()=> "Deletes all server-based roles, setting the config back to user-based",
	usage: ()=> [" - Resets server-based roles"],
	execute: async (bot, msg, args) => {
		await msg.channel.send("WARNING: This will delete all of your indexed server-based roles. Are you sure you want to continue? (y/n)");
		var messages = await msg.channel.awaitMessages(m => m.author.id == msg.author.id, {max: 1, time: 30000});
		if(messages && messages[0]) {
			var conf = messages[0].content.toLowerCase();
			if(conf == "yes" || conf == "y") {
				try {
					var roles = await bot.stores.serverRoles.getAll(msg.guild);
					if(!roles) return "No roles to delete";
					for(var i = 0; i < roles.length; i++) {
						await roles[i].delete();
					}
					await bot.stores.configs.update(msg.guild.id, {role_mode: 0});
					await bot.stores.serverRoles.deleteAll(msg.guild.id);
					return "Roles deleted!";
				} catch(e) {
					return "ERR: "+(e.message || e);
				}

				return "Roles deleted and role mode reset to user-based roles!";
			} else {
				return "Action cancelled!";
			}
		}
	},
	guildOnly: true,
	permissions: ['MANAGE_ROLES']
}