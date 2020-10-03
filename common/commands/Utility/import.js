module.exports = {
	help: ()=> "Imports saved colors",
	usage: ()=> [" - Imports an archive of your saved colors from a .json file attached to the message",
				 " [url] - Imports saved colors from a linked .json"],
	execute: async (bot, msg, args) => {
		let file = msg.attachments.first();
		if(!file) file = args[0];
		if(!file) return "Please attach or link to a .json file to import when running this command!";
		let data;
		try {
			data = (await bot.fetch(file.url || file)).data;
		} catch(e) {
			console.log(e);
			return "Please attach a valid .json file.";
		}

		var message = await msg.channel.send("WARNING: This will overwrite your existing data. Are you sure you want to import these colors?");
		["✅","❌"].forEach(r => message.react(r));
		
		var confirm = await bot.utils.getConfirmation(bot, message, msg.author);
		if(confirm.msg) return confirm.msg;

		try {
			await bot.stores.colors.import(msg.author.id, data);
		} catch(e) {
			return "ERR: "+e;
		}
		
		return "Colors imported!";
	}
}