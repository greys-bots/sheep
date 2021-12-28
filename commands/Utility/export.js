module.exports = {
	help: ()=> "Exports saved colors",
	usage: ()=> [" - Exports an archive of your saved colors",
				 " [color name] - "],
	execute: async (bot, msg, args) => {
		try {
			var data = await bot.stores.colors.export(msg.author.id, args[0] ? args[0].toLowerCase() : null);

			await msg.author.send({
				content: "Here's your file!",
				files: [
					{
						attachment: Buffer.from(JSON.stringify(data)),
						name: "saved_colors.json"
					}
				]
			})
		} catch(e) {
			return 'Err! '+(e.message ?? e);
		}

		return "Check your DMs!";
	}
}