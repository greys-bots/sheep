module.exports = {
	help: ()=> "Set whether the bot shows the accessibility readout when changing colors",
	usage: [
		" - Views and optionally clears the current setting",
		" [true|false] - Sets the value"
	],
	execute: async (bot, msg, args) => {
		var config = await bot.stores.userConfigs.get(msg.author.id);
		if(!config) config = {a11y: false, new: true};

		if(!args[0]) {
			var message = await msg.channel.send(`Current value: ${config.a11y}\nWould you like to reset it?`);
			["✅", "❌"].forEach(r => message.react(r));

			var conf = await bot.utils.getConfirmation(bot, message, msg.author);
			if(conf.msg) return conf.msg;

			await bot.stores.configs.update(msg.author.id, {a11y: false});
			return 'Config cleared!';
		}

		var arg = args[0].toLowerCase();
		var val;
		if(['y', 'yes', 'true', '1'].includes(arg)) val = true;
		else if(['n', 'no', 'false', '0'].includes(arg)) val = false;
		else return "That value isn't valid! Try something like `true` or `false`";

		console.log(val);
		if(config.new) await bot.stores.userConfigs.create(msg.author.id, {a11y: val});
		else await bot.stores.userConfigs.update(msg.author.id, {a11y: val});
		return 'Config updated!'
	}
}