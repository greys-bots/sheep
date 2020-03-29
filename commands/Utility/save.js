module.exports = {
	help: ()=> "Save a color for use later",
	usage: ()=> [" - Lists currently saved colors",
				 " [name] - Gets info on a saved color",
				 " [name] [color] - Saves a color with the given name. NOTE: Only one-word names are supported",
				 " rename [name] [new name] - Renames a saved color",
				 " delete [name] - Deletes a saved color. Use `all` or `*` to delete all your colors at once"],
	execute: async (bot, msg, args) => {
		if(!args[0]) {
			var colors = await bot.utils.getSavedColors(bot, msg.author.id);
			if(!colors || !colors[0]) return "You don't have any saved colors!";

			var embeds = await bot.utils.genEmbeds(bot, colors, c => {
				var color = bot.tc(c.color);
				return {name: c.name, value: color.toHexString()}
			}, {
				title: "Saved Colors"
			})

			var message = await msg.channel.send(embeds[0]);
			if(embeds[1]) {
				if(!bot.menus) bot.menus = {};
				bot.menus[message.id] = {
					user: msg.author.id,
					data: embeds,
					index: 0,
					timeout: setTimeout(()=> {
						if(!bot.menus[message.id]) return;
						try {
							message.reactions.removeAll();
						} catch(e) {
							console.log(e);
						}
						delete bot.menus[msg.author.id];
					}, 900000),
					execute: bot.utils.paginateEmbeds
				};
				["\u2b05", "\u27a1", "\u23f9"].forEach(r => message.react(r));
			}
			return;
		} else if(args[0] && !args[1]) {
			var color = await bot.utils.getSavedColor(bot, msg.author.id, args[0].toLowerCase());
			if(!color) return "Color not found! D:";
			color = bot.tc(color.color); //color doesn't seem like a real word anymore huh

			return {embed: {
				title: "Color "+color.toHexString().toUpperCase(),
				image: {
					url: `https://sheep.greysdawn.com/sheep/${color.toHex()}`
				},
				color: parseInt(color.toHex(), 16),
				footer: {
					text: `${color.toRgbString()}`
				}
			}}
		} else {
			var name = args[0];
			var color = args.slice(1).join("");
			var exists;
			var reaction;

			var c = bot.tc(color.toLowerCase());
			if(!c.isValid()) return "That color isn't valid :(";

			var exists = await bot.utils.getSavedColor(bot, msg.author.id, name);
			console.log(exists);
			if(exists) {
				var message = await msg.channel.send("A saved color with that name already exists! Would you like to override it?");
				["✅","❌"].forEach(r => message.react(r));

				reaction = await message.awaitReactions((r, u) => ["✅","❌"].includes(r.emoji.name) && u.id == msg.author.id, {time: 30000, max: 1});
				reaction = reaction.first();
				await message.reactions.removeAll();
				if(!reaction) return "ERR: timed out. Aborting";
				if(reaction.emoji.name == "❌") return "Action cancelled";
			}

			c = bot.tc(name);
			if(c.isValid() && !exists) { //don't make them deal with 2 confirmations; they've already heard it before
				var message = await msg.channel.send("That name is already used as an official color! Would you like to override it?");
				["✅","❌"].forEach(r => message.react(r));

				reaction = await message.awaitReactions((r, u) => ["✅","❌"].includes(r.emoji.name) && u.id == msg.author.id, {time: 30000, max: 1});
				reaction = reaction.first();
				await message.reactions.removeAll();
				if(!reaction) return "ERR: timed out. Aborting";
				if(reaction.emoji.name == "❌") return "Action cancelled";
			}

			var scc;
			if(!exists) scc = await bot.utils.saveColor(bot, msg.author.id, name, color);
			else scc = await bot.utils.updateSavedColor(bot, msg.author.id, name, {color: color});

			if(scc) return "Color saved!";
			else return "Something went wrong";
		}
		
	},
	alias: ["sv"],
	subcommands: {}
}

module.exports.subcommands.rename = {
	help: ()=> "Renames a saved color",
	usage: ()=> [" [name] [newname] - Renames the given color"],
	execute: async (bot, msg, args) => {
		if(!args[1]) return "Please provide a color and the new name";
		
		var color = await bot.utils.getSavedColor(bot, msg.author.id, args[0].toLowerCase());
		if(!color) return msg.channel.send("Color not found! D:");

		var exists = await bot.utils.getSavedColor(bot, msg.author.id, args[0]);
		if(exists && color.name !== exists.name) return "Color with that name already exists! Aborting";

		var scc = await bot.utils.updateSavedColor(bot, msg.author.id, color.name, {name: args[1]});
		if(scc) return "Color renamed!";
		else return "Something went wrong"
	},
	alias: ["rn", "name"]
}

module.exports.subcommands.delete = {
	help: ()=> "Delete a saved color",
	usage: ()=> [" [name] - Deletes the given color"],
	execute: async (bot, msg, args) => {
		var message;
		var reaction;
		if(["all", "*"].includes(args[0].toLowerCase())) {
			var colors = await bot.utils.getSavedColors(bot, msg.author.id);
			if(!colors || !colors[0]) return "You have no saved colors";

			message = await msg.channel.send("Are you sure you want to delete ALL your saved colors?");
			["✅","❌"].forEach(r => message.react(r));
			reaction = await message.awaitReactions((r, u) => ["✅","❌"].includes(r.emoji.name) && u.id == msg.author.id, {time: 30000, max: 1});
			reaction = reaction.first();
			if(!reaction) return "ERR: timed out. Aborting";
			if(reaction.emoji.name == "❌") return "Action cancelled";

			var scc = await bot.utils.deleteSavedColors(bot, msg.author.id);
			if(scc) return "Colors deleted!";
			else return "Something went wrong"
		} else {
			var color = await bot.utils.getSavedColor(bot, msg.author.id, args[0].toLowerCase());
			if(!color) return "Color not found! D:";

			message = await msg.channel.send("Are you sure you want to delete this color?");
			["✅","❌"].forEach(r => message.react(r));
			reaction = await message.awaitReactions((r, u) => ["✅","❌"].includes(r.emoji.name) && u.id == msg.author.id, {time: 30000, max: 1});
			reaction = reaction.first();
			if(!reaction) return "ERR: timed out. Aborting";
			if(reaction.emoji.name == "❌") return "Action cancelled";

			var scc = await bot.utils.deleteSavedColor(bot, msg.author.id, color.name);
			if(scc) return "Color deleted!";
			else return "Something went wrong"
		}	
	},
	alias: ["del", "remove", "rmv"]
}