const { Models: { SlashCommand } } = require('frame');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'disable',
			description: "Disable usage of specific commands",
			options: [
				{
					name: 'module',
					description: "Disable an entire module",
					type: 3,
					required: false
				},
				{
					name: 'command',
					description: "Disable a specific command in a module",
					type: 3,
					required: false
				},
				{
					name: 'subcommand',
					description: "Disable a specific command's subcommand",
					type: 3,
					required: false
				}
			],
			usage: [
				"[module] - Disable a whole module",
				"[module] [command] - Disable a module's command",
				"[module] [command] [subcommand] - Disable a command's subcommand"	
			],
			extra: "Only guild-only commands can be disabled",
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
		
		if(!mod && !cmd && !scmd) {
			if(!cfg?.disabled?.length) return "Nothing disabled!";
			
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

		if(!cm.guildOnly || ["enable", "disable"].includes(cm.data.name))
			return "That command can't be disabled!";

		name = name.trim();
		if(!disabled.includes(name)) disabled.push(name);

		if(cfg) await this.#stores.configs.update(ctx.guild.id, {disabled});
		else await this.#stores.configs.create(ctx.guild.id, {disabled});
		return "Config updated!";
	}
}

module.exports = (bot, stores) => new Command(bot, stores);