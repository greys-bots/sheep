module.exports = {
	help: ()=> "Change your color",
	usage: ()=> [" [color] - Change your color to the one given"],
	desc: ()=> "Colors can be hex codes or color names! Full list of names found [here](https://www.w3schools.com/colors/colors_names.asp)\nNote: Roles above the automatically-created Sheep role MUST be uncolored, or this won't work!",
	execute: async (bot, msg, args, config = {role_mode: 0})=> {
		if(config.role_mode == 0) {
			var color;
			if(!args[0]) color = bot.tc(Math.floor(Math.random()*16777215).toString(16))
			else color = bot.tc(args.join(''));
			if(!color.isValid()) return ('That is not a valid color :(');
			var crgb = color.toRgb();
			var text = (crgb.r * 0.299) + (crgb.g * 0.587) + (crgb.b * 0.114) > 186 ? '000000' : 'ffffff';
			await msg.channel.createMessage({embed: {
				title: "Color "+color.toHexString().toUpperCase(),
				image: {
					url: `https://sheep.greysdawn.com/sheep/${color.toHex()}`
				},
				color: parseInt(color.toHex(), 16),
				footer: {
					text: `${color.toRgbString()}`
				}
			}}).then(message => {
				if(!bot.posts) bot.posts = {};
				bot.posts[message.id] = {
					user: msg.author.id,
					data: color,
					timeout: setTimeout(()=> {
						if(!bot.posts[message.id]) return;
						message.removeReactions()
						delete bot.posts[message.id];
					}, 900000)
				};
				message.addReaction("\u2705");
				message.addReaction("\u274C");
				message.addReaction("🔀");
				return;
			}).catch(e => {
				console.log(e);
				return ('Baa! There was an error D:');
			});
		} else {
			var role = msg.guild.roles.find(r => r.name.toLowerCase() == args.join(" "));
			if(!role) return "Role not found";

			role = await bot.utils.getServerRole(bot, msg.guild.id, role.id);
			if(!role) return "Server role not found";

			var roles = await bot.utils.getServerRoles(bot, msg.guild);

			for(var i = 0; i < roles.length; i++) {
				if(msg.member.roles.includes(roles[i].id)) {
					try {
						await bot.removeGuildMemberRole(msg.guild.id, msg.author.id, roles[i].id);
					} catch(e) {
						console.log(e.stack);
						return "Something went wrong while removing the role";
					}
				}
			}
			

			try {
				await bot.addGuildMemberRole(msg.guild.id, msg.author.id, role.role_id);
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