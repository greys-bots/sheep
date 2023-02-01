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
					name: 'module',
					description: "Enable an entire module",
					type: 3,
					required: false
				},
				{
					name: 'command',
					description: "Enable a specific command in a module",
					type: 3,
					required: false
				},
				{
					name: 'subcommand',
					description: "Enable a specific command's subcommand",
					type: 3,
					required: false
				}
			],
			usage: [
				"[module] - Enable a whole module",
				"[module] [command] - Enable a module's command",
				"[module] [command] [subcommand] - Enable a command's subcommand"	
			],
			permissions: ["ManageGuild"],
			guildOnly: true
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var mod = ctx.options.getString('module')?.toLowerCase().trim();
		var cmd = ctx.options.getString('command')?.toLowerCase().trim();
		var scmd = ctx.options.getString('subcommand')?.toLowerCase().trim();

		var cfg = await this.#stores.configs.get(ctx.guild.id);
		if(!cfg?.disabled?.length) return "Nothing disabled!";

		if(!mod && !cmd && !scmd) {
			return {embeds: [{
				title: "Disabled commands",
				description: cfg.disabled.join("\n")
			}]}
		}

		var disabled = cfg?.disabled ?? [];
		var name = "";
		var cm;
		var cmds;
		if(mod) {
			cm = this.#bot.slashCommands.get(mod);
			if(!cm) return "Module not found!";
			cmds = cm.options.map(o => o);
			name += (cm.name ?? cm.data.name) + " ";
		} else {
			cmds = this.#bot.slashCommands.map(c => c);
		}

		if(cmd) {
			cm = cmds.find(c => (c.name ?? c.data.name) == cmd);
			if(!cm) return "Command not found!";
			cmds = cm.options?.map(o => o);
			name += `${cm.name ?? cm.data.name} `;

			if(scmd) {
				cm = cmds?.find(c => (c.name ?? c.data.name) == scmd);
				if(!cm) return "Subcommand not found!";
				name += `${cm.name ?? cm.data.name}`;
			}
		}

		name = name.trim();
		disabled = disabled.filter(x => x != name);

		await this.#stores.configs.update(ctx.guild.id, {disabled});
		return "Config updated!";
	}
}

module.exports = (bot, stores) => new Command(bot, stores);