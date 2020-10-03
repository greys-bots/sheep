module.exports = {
	help: ()=> "Change your color",
	usage: ()=> [" [color] - Change your color to the one given",
				 " index [user] [role] - Set an existing role as the given user's role. For mods only!"],
	desc: ()=> ["Colors can be hex codes or color names! Full list of names found [here](https://www.w3schools.com/colors/colors_names.asp)",
				"Note: Roles above the automatically-created Sheep role MUST be uncolored, or this won't work!",
				"The role you're trying to edit must be below my highest role as well!"].join("\n"),
	execute: async (bot, msg, args)=> {
		var config = (await bot.stores.configs.get(msg.guild.id)) || {role_mode: 0};
		if(config.role_mode == 0) {
			var color;
			if(!args[0]) color = bot.tc.random();
			else {
				color = await bot.stores.colors.get(msg.author.id, args.join("").toLowerCase());
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
			}});
			['✅', '❌', '🔀'].forEach(r => message.react(r));

			var done = false;
			var member = await msg.guild.members.fetch(msg.author.id);
			var timeout = setTimeout(async ()=> {
				done = true;
				await message.edit('Action timed out', {embed: null});
				await message.reactions.removeAll();
			}, 3 * 60 * 1000);
			while(!done) {
				var choice = await bot.utils.handleChoices(bot, message, msg.author, [
					{
						name: "yes",
						accepted: ['yes', 'y', '✅']
					},
					{
						name: 'no',
						accepted: ['no', 'n', '❌'],
						msg: 'Action cancelled!'
					},
					{
						name: 'random',
						accepted: ['random', 'r', '🔀']
					}
				]);

				switch(choice.name) {
					case 'yes':
						var srole = msg.guild.me.roles.cache.find(r => r.name.toLowerCase().includes("sheep") || r.managed);
						var role = await bot.stores.userRoles.get(msg.guild.id, msg.author.id);
						console.log(srole ? srole.position : "No sheep role");
						var options = {
							name: role ? role.raw.name : msg.author.id,
							color: color.toHex(),
							position: srole ? srole.position - 1 : 0,
							mentionable: config.pingable
						}

						try {
							if(role && role.raw && !role.raw.deleted) {
								console.log(role.raw.position);
								role = await role.raw.edit(options);
							} else {
								role = await msg.guild.roles.create({data: options});
								role.new = true;
							}
							console.log(role.position);
							await member.roles.add(role.id);
							await message.edit("Color successfully changed to "+color.toHexString()+"! :D", {embed: null});
							await message.reactions.removeAll();
							if(role.new) await bot.stores.userRoles.create(msg.guild.id, member.id, role.id);
						} catch(e) {
							console.log(e.stack);
							msg.channel.send([
								`Something went wrong! ERR: ${e.message}\n`,
								`Try moving my highest role above any roles you're trying to color, then try again!\n`,
								`If the error continues, please report this in `,
								`my development server: https://discord.gg/EvDmXGt`
							]);
						}

						done = true;
						clearTimeout(timeout);
						timeout = setTimeout(async ()=> {
							done = true;
							await message.edit('Action timed out', {embed: null});
							await message.reactions.removeAll();
						}, 3 * 60 * 1000);
						break;
					case 'random':
						var color = bot.tc.random();
						message.edit({embed: {
							title: "Color "+color.toHexString().toUpperCase(),
							image: {
								url: `https://sheep.greysdawn.com/sheep/${color.toHex()}`
							},
							color: parseInt(color.toHex(), 16),
							footer: {
								text: `${color.toRgbString()}`
							}
						}});
						if(choice.react) await choice.react.users.remove(member.id);
						else if(choice.message) await choice.message.delete();
						clearTimeout(timeout);
						break;
					default:
						message.edit("Action cancelled", {embed: null});
						message.reactions.removeAll();
						done = true;
						clearTimeout(timeout);
						break;
				}
			}

			return;
		} else {
			var role = await msg.guild.roles.cache.find(r => r.name.toLowerCase() == args.join(" "));
			if(!role) return "Role not found";

			role = await bot.stores.serverRoles.get(msg.guild.id, role.id);
			if(!role) return "Server role not found";

			var roles = await bot.stores.serverRoles.getAll(msg.guild.id);
			if(!roles || !roles[0]) return "Couldn't get role list :(";

			for(var rl of roles) {
				if(msg.member.roles.cache.find(r => r.id == rl.role_id)) {
					try {
						await msg.member.roles.remove(rl.role_id);
					} catch(e) {
						console.log(e.stack);
						return "ERR: "+e.message;
					}
				}
			}		

			try {
				await msg.member.roles.add(role.role_id);
			} catch(e) {
				console.log(e.stack);
				return "ERR: "+e.message;
			}
			
			return "Added!"
		}
	},
	guildOnly: true,
	alias: ['c', 'cl', 'colour', 'color', 'ch'],
	subcommands: {}
}

module.exports.subcommands.index = {
	help: ()=> "Associate an existing role as a user's color role",
	usage: ()=> [" [user] [role] - Set the given role as the one the user can change the color of"],
	desc: ()=> "The user can be their ID or @mention; the role can be the name, ID, or @mention",
	execute: async (bot, msg, args) => {
		if(!args[1]) return "This command needs a user ID and the role to index!";

		var member = msg.guild.members.cache.find(m => m.id == args[0].replace(/[<@!>]/g, ""));
		if(!member) return "Member not found!";

		var role = await bot.stores.userRoles.get(msg.guild.id, member.id);
		if(role) return "They already have a color role!";

		role = msg.guild.roles.cache.find(r => r.id == args[1].replace(/[<@&>]/g, "") || r.name.toLowerCase() == args.slice(1).join(" ").toLowerCase());
		if(!role) return "Role not found :(";

		try {
			bot.stores.userRoles.create(msg.guild.id, member.id, role.id);
			member.roles.add(role.id);
		} catch(e) {
			return "ERR: "+(e.message || e);
		}

		return "Role indexed! They can now change its color with `s!c`";
	},
	permissions: ["MANAGE_ROLES"]
}