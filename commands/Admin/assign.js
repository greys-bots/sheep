module.exports = {
	help: ()=> "Assigns a color or color role to a user",
	usage: () => [" [user] [color/role] - Assigns a color or role to the given user"],
	execute: async (bot, msg, args) => {
		if(!args[0]) return "Please provide a user and color to assign!";
		var member = msg.guild.members.cache.find(m => m.id == args[0].replace(/[<@!>]/g, ""));
		if(!member) return "Couldn't find that member :(";
		var role = msg.guild.roles.cache.find(r => [r.name.toLowerCase(), r.id].includes(args.slice(1).join(" ").replace(/[<@&>]/g, "").toLowerCase()));
		if(role) {
			var exists = await bot.stores.userRoles.get(msg.guild.id, member.id);
			if(exists) return "That user already has a color role associated with them!";

			try {
				await bot.stores.userRoles.create(msg.guild.id, member.id, role.id);
			} catch(e) {
				return "ERR: "+e.message;
			}

			return "Role successfully linked to that user!";
		}

		var color = bot.tc(args.slice(1).join(" "));
		if(!color.isValid()) return "That color isn't valid :(";
		var config = await bot.stores.configs.get(msg.guild.id);
		if(!config) config = {};

		var srole = msg.guild.me.roles.cache.find(r => r.name.toLowerCase() == "sheep");
		var userrole = await bot.stores.userRoles.get(msg.guild.id, member.id);

		var options = {
			name: role ? role.name : member.id,
			color: color.toHex(),
			position: srole ? srole.position : 0,
			mentionable: config.pingable
		}

		try {
			if(userrole) {
				options.position = srole ? options.position - 1 : options.position;
				userrole = await userrole.raw.edit(options);
			} else {
				userrole = await msg.guild.roles.create({data: options});
				userrole.new = true;
			}
			await member.roles.add(userrole.id);
			if(userrole.new) await bot.stores.userRoles.create(msg.guild.id, member.id, userrole.id);
			return "Color successfully changed to "+color.toHexString()+"! :D";
		} catch(e) {
			console.log(e.stack);
			return `Something went wrong! ERR: ${e.message}\nIf the error continues, please report this in my development server: https://discord.gg/EvDmXGt`;
		}
	},
	permissions: ["MANAGE_ROLES"]
}
