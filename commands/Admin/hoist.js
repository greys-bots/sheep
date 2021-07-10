module.exports = {
	help: ()=> "Set the role the bot places other roles under",
	usage: ()=> [
		" - Views and optionally clears the current setting",
		" [role id] - Sets the value"
	],
	desc: ()=> `By default, Sheep places roles under any role that contains the word ` +
			   `"sheep" and is assigned to the bot. You can use this to change what role the bot should ` +
			   `use for this`,
	execute: async (bot, msg, args) => {
		var config = await bot.stores.configs.get(msg.guild.id);
		if(!config) config = {hoist: "", new: true};

		var role;
		if(!args[0]) {
			if(!config.hoist) return "No role set!";
			try {
				role = await msg.guild.roles.fetch(config.hoist);
			} catch(e) {
				console.log(e)
			}

			if(!role) {
				await bot.stores.configs.update(msg.guild.id, {hoist: ""});
				return "Couldn't find configured role; config reset!";
			}
			var message = await msg.channel.send(`Current value: ${role.name}\nWould you like to reset it?`);
			["✅", "❌"].forEach(r => message.react(r));

			var conf = await bot.utils.getConfirmation(bot, message, msg.author);
			if(conf.msg) return conf.msg;

			await bot.stores.configs.update(msg.guild.id, {hoist: ""});
			return 'Config cleared!';
		}

		var arg = args.join(" ").toLowerCase();
		var groles = await msg.guild.roles.fetch();
		role = groles.cache.find(r => [r.name.toLowerCase(), r.id].includes(arg));
		if(!role) return "Role not found! D:";
		
		if(config.new) await bot.stores.configs.create(msg.guild.id, {hoist: role.id});
		else await bot.stores.configs.update(msg.guild.id, {hoist: role.iid});
		return 'Config updated!'
	},
	guildOnly: true,
	permissions: ['MANAGE_GUILD'],
	alias: ['lift']
}