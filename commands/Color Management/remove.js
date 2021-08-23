module.exports = {
	help: ()=> "Removes your color",
	usage: ()=> [" - Removes the color role you have"],
	execute: async (bot, msg, args, config = {role_mode: 0})=> {
		if(config.role_mode == 0) {
			var role = await bot.stores.userRoles.get(msg.guild.id, msg.member.id);
			if(!role) return "You don't have a color role!";
			try {
				await role.raw.delete("Removed color");
			} catch(e) {
				console.log(e);
				return "ERR: "+e.message;
			}
			
			return 'Color successfully removed! :D';
		} else {
			var roles = await bot.stores.serverRoles.getAll(msg.guild.id);
			var role = await bot.stores.userRoles.get(msg.guild.id, msg.member.id);
			if(role) {
				try {
					await role.raw.delete("Removed color");
				} catch(e) {
					console.log(e);
					return "ERR: "+e.message;
				}
			}
			if(roles) {
				for(var i = 0; i < roles.length; i++) {
					if(msg.member.roles.cache.find(r => r.id == roles[i].role_id)) {
						try {
							await msg.member.roles.remove(roles[i].role_id);
						} catch(e) {
							console.log(e);
							return "ERR: "+e.message;
						}	
					}
				}
			}
			return "Color successfully removed! :D";
		}
	},
	guildOnly: true,
	alias: ['r', 'rmv', 'clear', 'delete'],
	subcommands: {}
}

module.exports.subcommands.all = {
	help: ()=> "Removes all the color roles on the server",
	usage: ()=> [" - Deletes all of the server's colored roles"],
	execute: async (bot, msg, args) => {
		var message = await msg.channel.send("Are you sure you want to do this? (y/n)");
		["✅","❌"].forEach(r => message.react(r));

		var confirm = await bot.utils.getConfirmation(bot, message, msg.author);
		if(confirm.msg) return confirm.msg;

		var roles = await bot.stores.serverRoles.getAll(msg.guild.id);
		if(roles) {
			try {
				for(var r of roles) await bot.deleteRole(msg.guild.id, r.id);
			} catch(e) {
				console.log(e);
				return "Error:\n"+e.message;
			}
		}

		try {
			for(var m of msg.guild.members.cache) {
				var role = await bot.stores.userRoles.get(msg.guild.id, m.id);
				if(role) await bot.deleteRole(msg.guild.id, role.role_id);
			}
		} catch(e) {
			console.log(e);
			return "Error:\n"+e.message;
		}

		return "Roles deleted!";
	},
	guildOnly: true,
	alias: ['*'],
	permissions: ["MANAGE_ROLES"]
}