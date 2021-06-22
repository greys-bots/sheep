module.exports = {
	help: ()=> "Set the server's readability requirement",
	usage: ()=> [
		" - Views and optionally clears the current setting",
		" [true|false] - Sets the value"
	],
	desc: ()=> `"Readability" is used to determine if a color is readable- or can be seen with `+
			   `little eye strain- on Discord's light and dark themes. This is an accessibility feature `+
			   `that can help people to be able to properly see what colors are easily visible `+
			   `and what colors aren't to those with color blindness or sensitive eyes`,
	execute: async (bot, msg, args) => {
		var config = await bot.stores.configs.get(msg.guild.id);
		if(!config) config = {readable: false, new: true};

		if(!args[0]) {
			var message = await msg.channel.send(`Current value: ${config.readable}\nWould you like to reset it?`);
			["✅", "❌"].forEach(r => message.react(r));

			var conf = await bot.utils.getConfirmation(bot, message, msg.author);
			if(conf.msg) return conf.msg;

			await bot.stores.configs.update(msg.guild.id, {readable: false});
			return 'Config cleared!';
		}

		var arg = args[0].toLowerCase();
		var val;
		if(['y', 'yes', 'true', '1'].includes(arg)) val = true;
		else if(['n', 'no', 'false', '0'].includes(arg)) val = false;
		else return "That value isn't valid! Try something like `true` or `false`";

		if(config.new) await bot.stores.configs.create(msg.guild.id, {readable: val});
		else await bot.stores.configs.update(msg.guild.id, {readable: val});
		return 'Config updated!'
	},
	guildOnly: true,
	permissions: ['MANAGE_SERVER'],
	alias: ['a11y', 'readability']
}