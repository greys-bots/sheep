module.exports = {
	help: ()=> "Link your color role with another user",
	usage: ()=> [" [user] - Links your color role to another user, useful for those with alt accounts and servers that require them to use one color"],
	desc: ()=> ["The user can be a @mention, user ID, or username#1234. ",
				"If the user you're linking to already has a role, they'll be asked if they want to overwrite it.\n",
				"Linking roles means that any changes (name, color, removal) will affect both users, as they share one role. ",
				"Note that removing the role will unlink both users, so you'll have to link the role again if you want it linked."].join(""),
	execute: async (bot, msg, args, config = {role_mode: 0}) => {
		if(config.role_mode == 1) return "Can't link colors in server-based color mode!";

		var user = msg.guild.members.find(m => {
			return m.id == args[0].replace(/[<@!>]/g,"") ||
				`${m.username}#${m.discriminator}`.toLowerCase() ==
					args.join(" ").toLowerCase()
		});
		if(!user) return "Couldn't find that user :(";
		var role = await bot.utils.getUserRole(bot, msg.guild, msg.author.id);
		if(!role) return "You don't have a role to link!";
		var role2 = await bot.utils.getRawUserRole(bot, msg.guild, user.id);
		if(role2) {
			msg.channel.createMessage(`Other user has a color role already! ${user.mention}, would you like to overwrite it? (y/n)`);
			var resp = await msg.channel.awaitMessages(m => m.author.id == user.id, {time: 60000, maxMatches: 1});
			if(!resp || !resp[0]) return "ERR: timed out! Aborting...";
			else if(resp[0].content.toLowerCase() != "y") return "ERR: user declined role overwrite! Aborting...";
			await role2.delete("User accepted color overwrite");
		} else {
			await msg.channel.createMessage(`${user.mention}, please confirm that you want to link roles! (y/n)`);
			var resp = await msg.channel.awaitMessages(m => m.author.id == user.id, {time: 60000, maxMatches: 1});
			if(!resp || !resp[0]) return "ERR: timed out! Aborting...";
			else if(resp[0].content.toLowerCase() != "y") return "ERR: user declined role link! Aborting...";
		}

		try {
			await user.addRole(role);
		} catch(e) {
			console.log(e);
			return "ERR: "+e.message;
		}
		var scc = await bot.utils.addUserRole(bot, msg.guild.id, role, user.id);
		if(scc) return "Roles linked!";
		else return "Something went wrong D:"
	},
	guildOnly: true,
	alias: ["share"]
}