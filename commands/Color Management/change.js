module.exports = {
	help: ()=> "Change your color",
	usage: ()=> [" [color] - Change your color to the one given"],
	desc: ()=> "Colors can be hex codes or color names! Full list of names found [here](https://www.w3schools.com/colors/colors_names.asp)\nNote: Roles above the automatically-created Sheep role MUST be uncolored, or this won't work!",
	execute: async (bot, msg, args, config = {role_mode: 0})=> {
		if(config.role_mode == 0) {
			var color;
			if(!args[0]) color = bot.tc.random();
			else {
				color = await bot.utils.getSavedColor(bot, msg.author.id, args.join(""));
				if(color) color = bot.tc(color.color);
				else color = bot.tc(args.join(""));
			}

			if(!color.isValid()) return ("That color isn't valid :(");
			if(color.toHex()=="000000") color = bot.tc('001')
			var message = await msg.channel.send({embed: {
				title: "Color "+color.toHexString().toUpperCase(),
				image: {
					url: `https://sheep.greysdawn.com/sheep/${color.toHex()}`
				},
				color: parseInt(color.toHex(), 16),
				footer: {
					text: `${color.toRgbString()}`
				}
			}})

			if(!bot.menus) bot.menus = {};
			bot.menus[message.id] = {
				user: msg.author.id,
				data: color,
				timeout: setTimeout(()=> {
					if(!bot.menus[message.id]) return;
					message.reactions.removeAll()
					delete bot.menus[message.id];
				}, 900000),
				execute: bot.utils.handleChangeReacts
			};
			["\u2705", "\u274C", "🔀"].forEach(r => message.react(r));
			return;
		} else {
			var role = await msg.guild.roles.cache.find(r => r.name.toLowerCase() == args.join(" "));
			if(!role) return "Role not found";

			role = await bot.utils.getServerRole(bot, msg.guild.id, role.id);
			if(!role) return "Server role not found";

			var roles = await bot.utils.getServerRoles(bot, msg.guild);

			for(var i = 0; i < roles.length; i++) {
				if(msg.member.roles.cache.find(r => r.id == roles[i].id)) {
					try {
						await msg.members.roles.remove(roles[i].id);
					} catch(e) {
						console.log(e.stack);
						return "Something went wrong while removing the role";
					}
				}
			}		

			try {
				await msg.member.roles.add(role.role_id);
			} catch(e) {
				console.log(e.stack);
				return "Something went wrong while adding the role";
			}
			
			return "Added!"
		}
	},
	guildOnly: true,
	alias: ['c', 'cl', 'colour', 'color', 'ch']
}