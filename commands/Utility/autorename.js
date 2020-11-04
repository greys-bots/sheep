const VALS = {
	on: ['on', 'true', '1'],
	off: ['off', 'false', '0']
}

module.exports = {
	help: ()=> "Sets whether to automatically rename color roles when changing to a saved color",
	usage: ()=> [
		" - Views current value",
		` (${VALS.on.join(" | ")}) - Turns auto-renaming on`,
		` (${VALS.off.join(" | ")}) - Turns auto-renaming off`
	],
	execute: async (bot, msg, args) => {
		var cfg = await bot.stores.userConfigs.get(msg.author.id);

		if(!args[0]) {
			var message = await msg.channel.send(
				`Current value: ${cfg?.auto_rename ? 'on - roles WILL be renamed' : 'off'}\n` +
				`Would you like to toggle this setting?`
			)

			var confirm = await bot.utils.getConfirmation(bot, msg, msg.author);
			if(confirm.msg) return confirm.msg;

			try {
				if(cfg) await bot.stores.userConfigs.update(msg.author.id, {auto_rename: !cfg.auto_rename});
				else await bot.stores.userConfigs.create(msg.author.id, {auto_rename: true})
			} catch(e) {
				return "ERR: " + e;
			}

			return "Setting toggled!";
		}

		var arg = args[0].toLowerCase();
		var auto_rename;
		switch(true) {
			case VALS.on.includes(args[0].toLowerCase()):
				auto_rename = true;
				break;
			case VALS.off.includes(args[0].toLowerCase()):
				auto_rename = false;
				break;
			default:
				return "ERR! Invalid value!";
				break;
		}

		try {
			if(cfg) await bot.stores.userConfigs.update(msg.author.id, {auto_rename});
			else await bot.stores.userConfigs.create(msg.author.id, {auto_rename});
		} catch(e) {
			return "ERR: " + e;
		}
		
		return "Setting updated!";
	},
	alias: ['ar']
}