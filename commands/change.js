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
				if(!bot.menus) bot.menus = {};
				bot.menus[message.id] = {
					user: msg.author.id,
					data: color,
					timeout: setTimeout(()=> {
						if(!bot.menus[message.id]) return;
						message.removeReactions()
						delete bot.menus[message.id];
					}, 900000),
					execute: async function (m, emoji, config = {pingable: false}) {
						console.log(config);
						switch(emoji.name) {
							case '\u2705':
								var color = this.data;
								var position;
								var role;
								var n = false;
								var srole = msg.guild.roles.find(r => r.name.toLowerCase() == "sheep" && msg.guild.members.find(m => m.id == bot.user.id).roles.includes(r.id));
								if(!srole) console.log("Couldn't get position");
								else console.log(`Sheep position: ${srole.position}`)
								try {
									role = await bot.utils.getUserRole(bot, msg.guild, msg.author.id);
									if(!role) {
										role = await bot.createRole(msg.guild.id, {name: msg.author.id, color: parseInt(color.toHex(),16), mentionable: config.pingable});
										n = true;
									} else role = await bot.editRole(msg.guild.id, role, {color: parseInt(color.toHex(), 16), mentionable: config.pingable});
									await bot.addGuildMemberRole(msg.guild.id, msg.author.id, role.id);
									if(srole) await bot.editRolePosition(msg.guild.id, role.id, n ? srole.position-2 : srole.position-1);
									await bot.editMessage(m.channel.id, m.id, {content: "Color successfully changed to "+color.toHexString()+"! :D", embed: {}});
									await bot.removeMessageReactions(m.channel.id, m.id);
									delete bot.menus[m.id];
									await bot.utils.addUserRole(bot, msg.guild.id, role.id, msg.author.id);
									console.log(`Other role position: ${msg.guild.roles.find(r => r.id == role.id).position}`)
								} catch(e) {
									console.log(e.stack);
									var err = "";
									if(e.stack.includes('Client.editRolePosition')) {
										err = "Can't edit role position! Please report this issue in my support server: https://discord.gg/EvDmXGt";
									} else if(e.stack.includes('Client.editRole')) {
										err = "Can't edit role! Make sure I have the `manageRoles` permission";
									} else if(e.stack.includes('Client.removeMessageReactions')) {
										err = "Can't remove reactions! Make sure I have the `manageMessages` permission";
									}
									msg.channel.createMessage("Something went wrong! ERR: "+err);
								}
								break;
							case '\u274C':
								bot.editMessage(m.channel.id, m.id, {content: "Action cancelled", embed: {}});
								bot.removeMessageReactions(m.channel.id, m.id);
								delete bot.menus[m.id];
								break
							case '🔀':
								var color = bot.tc(Math.floor(Math.random()*16777215).toString(16));
								bot.editMessage(m.channel.id, m.id, {embed: {
									title: "Color "+color.toHexString().toUpperCase(),
									image: {
										url: `https://sheep.greysdawn.com/sheep/${color.toHex()}`
									},
									color: parseInt(color.toHex(), 16)
								}})
								await bot.removeMessageReaction(m.channel.id, m.id, emoji.name, msg.author.id);
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