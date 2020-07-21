module.exports = {
	help: ()=> "Assigns a color role to a user",
	usage: () => [" [user] [color] - Assigns a color to the given user"],
	execute: async (bot, msg, args) => {
		if(!args[0]) return "Please provide a user and color to assign!";
		var member = msg.guild.members.cache.find(m => m.id == args[0].replace(/[<@!>]/g, ""));
		if(!member) return "Couldn't find that member :(";
		var color = bot.tc(args.slice(1).join(""));
		if(!color.isValid()) return "That color isn't valid :(";
		var config = await bot.stores.configs.get(msg.guild.id);
		if(!config) config = {};

		var srole = msg.guild.me.roles.cache.find(r => r.name.toLowerCase() == "sheep");
		var role = await bot.stores.userRoles.get(msg.guild.id, member.id);

		var options = {
			name: role ? role.name : member.id,
			color: color.toHex(),
			position: srole ? srole.position : 0,
			mentionable: config.pingable
		}

		try {
			if(role) {
				options.position = srole ? options.position - 1 : options.position;
				role = await role.raw.edit(options);
			} else {
				role = await msg.guild.roles.create({data: options});
				role.new = true;
			}
			await member.roles.add(role.id);
			if(role.new) await bot.stores.userRoles.create(msg.guild.id, member.id, role.id);
			return "Color successfully changed to "+color.toHexString()+"! :D";
		} catch(e) {
			console.log(e.stack);
			return `Something went wrong! ERR: ${e.message}\nIf the error continues, please report this in my development server: https://discord.gg/EvDmXGt`;
		}
	},
	permissions: ["MANAGE_ROLES"]
}