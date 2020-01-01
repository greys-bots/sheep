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
				execute: async function (m, reaction, config = {pingable: false}) {
					switch(reaction.emoji.name) {
						case '\u2705':
							var srole = msg.guild.me.roles.find(r => r.name.toLowerCase() == "sheep");
							var role = await bot.utils.getRawUserRole(bot, msg.guild, msg.member);

							var options = {
								name: role ? role.name : msg.author.id,
								color: this.data.toHex(),
								position: srole ? srole.position : 0,
								mentionable: config.pingable
							}

							try {
								if(role) {
									options.position = srole ? options.position - 1 : options.position;
									role = await role.edit(options);
								} else {
									role = await msg.guild.roles.create({data: options});
								}
								await msg.member.roles.add(role.id);
								await m.edit("Color successfully changed to #"+options.color+"! :D", {embed: null});
								await m.reactions.removeAll();
								delete bot.menus[m.id];
								await bot.utils.addUserRole(bot, msg.guild.id, role.id, msg.author.id);
							} catch(e) {
								console.log(e.stack);
								msg.channel.send(`Something went wrong! ERR: ${e.message}\nIf the error continues, please report this in my development server: https://discord.gg/EvDmXGt`);
							}
							break;
						case '\u274C':
							m.edit("Action cancelled", {embed: null});
							m.reactions.removeAll();
							delete bot.menus[m.id];
							break
						case '🔀':
							var color = bot.tc(Math.floor(Math.random()*16777215).toString(16));
							m.edit({embed: {
								title: "Color "+color.toHexString().toUpperCase(),
								image: {
									url: `https://sheep.greysdawn.com/sheep/${color.toHex()}`
								},
								color: parseInt(color.toHex(), 16),
								footer: {
									text: `${color.toRgbString()}`
								}
							}})
							await reaction.users.remove(msg.author.id);
							clearTimeout(bot.menus[m.id].timeout)
							bot.menus[m.id] = {
								user: this.user,
								data: color,
								timeout: setTimeout(()=> {
									if(!bot.menus[m.id]) return;
									m.removeReactions()
									delete bot.menus[m.id];
								}, 900000),
								execute: this.execute
							};
							break;
					}
				}
			};
			message.react("\u2705");
			message.react("\u274C");
			message.react("🔀");
			return;
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