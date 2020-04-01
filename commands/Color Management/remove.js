module.exports = {
	help: ()=> "Removes your color",
	usage: ()=> [" - Removes the color role you have"],
	execute: async (bot, msg, args, config = {role_mode: 0})=> {
		if(config.role_mode == 0) {
			var role = await bot.utils.getRawUserRole(bot, msg.guild, msg.member);
			if(!role) return "You don't have a color role!";
			await role.delete();
			await bot.utils.deleteUserRole(bot, msg.guild.id, role.id);
			return 'Color successfully removed! :D';
		} else {
			var roles = await bot.utils.getServerRoles(bot, msg.guild);
			var role = await bot.utils.getRawUserRole(bot, msg.guild, msg.member);
			if(role) {
				await role.delete();
				await bot.utils.deleteUserRole(bot, msg.guild.id, role);
			}
			if(roles) {
				for(var i = 0; i < roles.length; i++) {
					if(msg.member.roles.cache.find(r => r.id == roles[i].id)) {
						await msg.member.roles.remove(roles[i].id);
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
		await msg.channel.send("Are you sure you want to do this? (y/n)");
		var response = await msg.channel.awaitMessages(m => m.author.id == msg.author.id, {maxMatches: 1, time: 60000});
		if(!response[0]) return msg.channel.send("ERR: timed out. Aborting");

		if(!["y","yes"].includes(response[0].content.toLowerCase())) return msg.channel.send("Action aborted");
		await msg.channel.send("Deleting roles, this may take a bit...");
		var roles = await bot.utils.getServerRoles(bot, msg.guild.id);
		if(roles) {
			try {
				await Promise.all(roles.map(async r => {
					await bot.deleteRole(msg.guild.id, r.id);
					return new Promise(res => setTimeout(()=> res(), 100));
				}))
			} catch(e) {
				console.log(e);
				return "Error:\n"+e.message;
			}
		}

		try {
			await Promise.all(msg.guild.members.cache.map(async m => {
				var role = await bot.utils.getUserRole(bot, msg.guild, m.id);
				if(role) await bot.deleteRole(msg.guild.id, role);
				return new Promise(res => setTimeout(()=> res(), 100));
			}))
		} catch(e) {
			console.log(e);
			return "Error:\n"+e.message;
		}

		var scc = await bot.utils.deleteColorRoles(bot, msg.guild.id);
		if(scc) return "Roles deleted!";
		else return "Something went wrong";

	},
	guildOnly: true,
	alias: ['*'],
	permissions: ["MANAGE_ROLES"]
}