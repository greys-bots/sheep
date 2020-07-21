module.exports = {
	help: ()=> "Save a color for use later",
	usage: ()=> [" - Lists currently saved colors",
				 " [name] - Gets info on a saved color",
				 " [name] [color] - Saves a color with the given name. NOTE: Only one-word names are supported",
				 " rename [name] [new name] - Renames a saved color",
				 " delete [name] - Deletes a saved color. Use `all` or `*` to delete all your colors at once"],
	execute: async (bot, msg, args) => {
		if(!args[0]) {
			var colors = await bot.stores.colors.getAll(msg.author.id);
			if(!colors || !colors[0]) return "You don't have any saved colors!";

			var embeds = await bot.utils.genEmbeds(bot, colors, c => {
				var color = bot.tc(c.color);
				return {name: c.name, value: color.toHexString()}
			}, {
				title: "Saved Colors"
			})

			return embeds;
		} else if(args[0] && !args[1]) {
			var color = await bot.stores.colors.get(msg.author.id, args[0].toLowerCase());
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

			var exists = await bot.stores.colors.get(msg.author.id, name);
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

			try {
				if(!exists) await bot.stores.colors.create(msg.author.id, name, {color: color});
				else await bot.stores.colors.update(msg.author.id, name, {color: color});
			} catch(e) {
				console.log(e);
				return "ERR: "+e;
			}

			return "Color saved!";
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
		
		var color = await bot.stores.colors.get(msg.author.id, args[0].toLowerCase());
		if(!color) return msg.channel.send("Color not found! D:");

		var exists = await bot.stores.colors.get(msg.author.id, args[0]);
		if(exists && color.name !== exists.name) return "Color with that name already exists! Aborting";

		try {
			await bot.stores.colors.update(msg.author.id, color.name, {name: args[1]});
		} catch(e) {
			return "ERR: "+e;
		}

		return "Color renamed!";
	},
	alias: ["rn", "name"]
}

module.exports.subcommands.delete = {
	help: ()=> "Delete a saved color",
	usage: ()=> [" [name] - Deletes the given color",
				 " all|* - Deletes all saved colors"],
	execute: async (bot, msg, args) => {
		if(!args[0]) return "Please give me something to delete!";
		var message;
		var reaction;
		if(["all", "*"].includes(args[0].toLowerCase())) {
			var colors = await bot.stores.colors.getAll(msg.author.id);
			if(!colors || !colors[0]) return "You have no saved colors";

			message = await msg.channel.send("Are you sure you want to delete ALL your saved colors?");
			["✅","❌"].forEach(r => message.react(r));
			reaction = await message.awaitReactions((r, u) => ["✅","❌"].includes(r.emoji.name) && u.id == msg.author.id, {time: 30000, max: 1});
			reaction = reaction.first();
			if(!reaction) return "ERR: timed out. Aborting";
			if(reaction.emoji.name == "❌") return "Action cancelled";

			try {
				await bot.stores.colors.deleteAll(msg.author.id);
			} catch(e) {
				return "ERR: "+e;
			}
			
			return "Colors deleted!";
		} else {
			var color = await bot.stores.colors.get(msg.author.id, args[0].toLowerCase());
			if(!color) return "Color not found! D:";

			message = await msg.channel.send("Are you sure you want to delete this color?");
			["✅","❌"].forEach(r => message.react(r));
			reaction = await message.awaitReactions((r, u) => ["✅","❌"].includes(r.emoji.name) && u.id == msg.author.id, {time: 30000, max: 1});
			reaction = reaction.first();
			if(!reaction) return "ERR: timed out. Aborting";
			if(reaction.emoji.name == "❌") return "Action cancelled";

			try {
				await bot.stores.colors.delete(msg.author.id, color.name);
			} catch(e) {
				return "ERR: "+e;
			}
			
			return "Color deleted!";
		}	
	},
	alias: ["del", "remove", "rmv", "rm"]
}