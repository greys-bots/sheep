module.exports = {
	help: ()=> "Link your color role with another user",
	usage: ()=> [" [user] - Links your color role to another user, useful for those with alt accounts and servers that require them to use one color"],
	desc: ()=> ["The user can be a @mention, user ID, or username#1234. ",
				"If the user you're linking to already has a role, they'll be asked if they want to overwrite it.\n",
				"Linking roles means that any changes (name, color, removal) will affect both users, as they share one role. ",
				"Note that removing the role will unlink both users, so you'll have to link the role again if you want it linked."].join(""),
	execute: async (bot, msg, args, config = {role_mode: 0}) => {
		if(config.role_mode == 1) return "Can't link colors in server-based color mode!";
		if(!args[0]) return "Please provide a user to link to";

		var user = msg.guild.members.cache.find(m => {
			return m.id == args[0].replace(/[<@!>]/g,"") ||
				`${m.username}#${m.discriminator}`.toLowerCase() ==
					args.join(" ").toLowerCase()
		});
		if(!user) return "Couldn't find that user :(";
		var role = await bot.stores.userRoles.get(msg.guild.id, msg.member.id);
		if(!role) return "You don't have a role to link!";
		var role2 = await bot.stores.userRoles.get(msg.guild.id, user.id);
		if(role2) {
			var message = msg.channel.send(`Other user has a color role already! ${user}, would you like to overwrite it?`);
			["✅","❌"].forEach(r => message.react(r));

			var confirm = await bot.utils.getConfirmation(bot, message, user);
			if(confirm.msg) return confirm.msg;
		} else {
			var message = await msg.channel.send(`${user}, please confirm that you want to link roles!`);
			["✅","❌"].forEach(r => message.react(r));

			var confirm = await bot.utils.getConfirmation(bot, message, user);
			if(confirm.msg) return confirm.msg;
		}

		try {
			await user.roles.add(role.role_id);
			await bot.stores.userRoles.create(msg.guild.id, user.id, role.role_id);
		} catch(e) {
			console.log(e);
			return "ERR: "+(e.message || e);
		}

		return "Roles linked!";
	},
	guildOnly: true,
	alias: ["share"]
}
