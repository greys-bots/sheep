module.exports = {
	help: ()=> "Imports saved colors",
	usage: ()=> [" - Imports an archive of your saved colors from a .json file attached to the message",
				 " [url] - Imports saved colors from a linked .json"],
	execute: async (bot, msg, args) => {
		let file = msg.attachments.first();
		console.log(file);
		if(!file) file = args[0];
		if(!file) return "Please attach or link to a .json file to import when running this command!";
		let data;
		try {
			data = (await bot.fetch(file.url || file)).data;
			console.log(data);
		} catch(e) {
			console.log(e);
			return "Please attach a valid .json file.";
		}

		message = await msg.channel.send("WARNING: This will overwrite your existing data. Are you sure you want to import these colors?");
		["✅","❌"].forEach(r => message.react(r));
		reaction = await message.awaitReactions((r, u) => ["✅","❌"].includes(r.emoji.name) && u.id == msg.author.id, {time: 30000, max: 1});
		reaction = reaction.first();
		if(!reaction) return "ERR: timed out. Aborting";
		if(reaction.emoji.name == "❌") return "Action cancelled";

		var scc = await bot.stores.colors.import(msg.author.id, data);
		if(scc) return "Colors imported!";
		else return "Something went wrong";
	}
}