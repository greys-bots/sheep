const { Models: { SlashCommand } } = require('frame');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'enable',
			description: "Enable usage of specific commands",
			options: [
				{
					name: 'command',
					description: "The command to enable",
					type: 3,
					required: false,
					autocomplete: true
				}
			],
			usage: [
				"[command] - Enable a command or group of commands"	
			],
			permissions: ["ManageGuild"],
			guildOnly: true
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var cn = ctx.options.getString('command')?.toLowerCase().trim();
		var cfg = await this.#stores.configs.get(ctx.guild.id);
		
		if(!cn) {
			if(!cfg?.disabled?.length) return "Nothing disabled!";
			
			return {embeds: [{
				title: "Disabled commands",
				description: cfg.disabled.join("\n")
			}]}
		}

		
		var disabled = cfg?.disabled ?? [];
		var name = cn;
		var [mod, cmd, scmd] = name.split(" ");
		var cm;
		var cmds;
		if(mod) {
			cm = this.#bot.slashCommands.get(mod);
			if(!cm) return "Module not found!";
			cmds = cm.subcommands.map(o => o);
		} else {
			cmds = this.#bot.slashCommands.map(c => c);
		}

		if(cmd) {
			cm = cmds.find(c => (c.name ?? c.name) == cmd);
			if(!cm) return "Command not found!";
			cmds = cm.subcommands?.map(o => o);

			if(scmd) {
				cm = cmds?.find(c => (c.name ?? c.name) == scmd);
				if(!cm) return "Subcommand not found!";
			}
		}

		name = name.trim();
		disabled = disabled.filter(x => x != name);

		await this.#stores.configs.update(ctx.guild.id, {disabled});
		return "Config updated!";
	}

	async auto(ctx) {
		var names = this.#bot.slashNames;
		var foc = ctx.options.getFocused();
		var res;
		if(!foc) res = names.map(n => ({ name: n, value: n }));
		else {
			foc = foc.toLowerCase()

			res = names.filter(n =>
				n.includes(foc)
			).map(n => ({
				name: n,
				value: n
			}))
		}

		return res.slice(0, 25);
	}
}

module.exports = (bot, stores) => new Command(bot, stores);