const { Models: { SlashCommand } } = require('frame');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'help',
			description: "View command help",
			options: [
				{
					name: 'command',
					description: "View help for a specific command in a module",
					type: 3,
					required: false,
					autocomplete: true
				}
			],
			usage: [
				"[command] - Get help for a command or group of commands"	
			],
			extra: "Examples:\n"+
				   "`/help command:form` - Shows form module help",
			ephemeral: true,
			v2: true
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var cn = ctx.options.getString('command')?.toLowerCase().trim();

		var embeds = [];
		var cmds;
		if(!cn) {
			embeds = [{
				components: [{
					type: 17,
					accent_color: 0xf5e4b5,
					components: [
						{
							type: 10,
							content: `Command Help`
						},
						{
							type: 14,
							spacing: 2
						},
						{
							type: 10,
							content:
								"# Baaa! I'm Sheep!\n" +
								"My job is to make color roles simple and easy!\n" +
								"To get started, use `/color change` (without brackets) " +
								"to assign yourself a color. If you'd like, you can also " +
								"`/color rename` it!\n\n" +
								"On top of that, I have other cool features, like:\n" +
								"## Saved colors\n" +
								"Save a color for later using `/util save new`! This lets you " +
									"use a handy name to refer to a color in commands\n" +
								"## Server-based colors\n" +
								"Server too big for individual user roles? No problem! " +
									"Use `/admin toggle` to toggle role modes and add roles for " +
									"users to pick from with `/admin roles create`\n" +
								"## Detailed help commands\n" +
								"You can get help with any command " +
									"(including subcommands)! Try it out by typing out a command when using `/help`\n" +
									"You can also flip the pages here to see all the commands!",
						},
						{
							type: 14,
							spacing: 2
						},
						{
							type: 1,
							components: [
								{
									type: 2,
									style: 5,
									label: 'Support Server',
									url: 'https://discord.gg/EvDmXGt'
								},
								{
									type: 2,
									style: 5,
									label: 'Patreon',
									url: 'https://patreon.com/greysdawn'
								},
								{
									type: 2,
									style: 5,
									label: 'Ko-Fi',
									url: 'https://ko-fi.com/greysdawn'
								},
							],
						}
					]	
				}]
			}];
			
			var mods = this.#bot.slashCommands.map(m => m).filter(m => m.subcommands.size);
			var ug = this.#bot.slashCommands.map(m => m).filter(m => !m.subcommands.size);
			for(let m of mods) {
				let e = {
					components: [{
						type: 17,
						accent_color: 0xf5e4b5,
						components: [{
							type: 10,
							content: `# ${m.name.toUpperCase()}\n${m.description}`
						}]
					}]
				}

				cmds = m.subcommands.map(o => o);
				cmds.forEach(c => {
					e.components[0].components.push({
						type: 10,
						content: `### /${m.name} ${c.name}\n${c.description}`
					})
				})
				embeds.push(e);
			}

			if(ug?.[0]) {
				var e = {
					components: [{
						type: 17,
						components: [{
							type: 10,
							content: `# UNGROUPED\nMiscellaneous commands`
						}]
					}]
				}

				for(var c of ug) e.components[0].components.push({
					type: 10,
					content: `### /${c.name}\n${c.description}`
				});
				embeds.push(e)
			}
		} else {
			var name = cn;
			var [mod, cmd, scmd] = cn.split(" ");
			var cm;
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

			if(cm.subcommands?.size) {
				let e = {
					components: [{
						type: 17,
						accent_color: 0xf5e4b5,
						components: [{
							type: 10,
							content: `# ${name.toUpperCase()}\n${cm.description}`
						}]
					}]
				}

				cm.subcommands.map(o => o).forEach(c => {
					e.components[0].components.push({
						type: 10,
						content: `### /${name.trim()} ${c.name}\n${c.description}`
					})
				})

				embeds = [e];
			} else {
				let e = {
					components: [{
						type: 17,
						accent_color: 0xf5e4b5,
						components: [{
							type: 10,
							content: `# /${name}\n${cm.description}`
						}]
					}]
				}

				if(cm.usage?.length) e.components[0].components.push({
					type: 10,
					content: `### Usage\n` + cm.usage.map(u => `/${name.trim()} ${u}`).join("\n")
				})

				if(cm.extra?.length) e.components[0].components.push({
					type: 10,
					content: `### Extra\n` + cm.extra
				})

				if(cm.permissions?.length) e.components[0].components.push({
					type: 10,
					content: `### Permissions\n` + cm.permissions.join(", ")
				})

				embeds = [e];
			}	
		}

		return embeds;
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


