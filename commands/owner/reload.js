const { Models: { SlashCommand } } = require('frame');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'reload',
			description: 'Reload the bot (or parts of it)',
			options: [{
				name: 'value',
				description: 'What to reload',
				type: 3,
				choices: [
					{
						name: 'bot',
						value: 'bot'
					},
					{
						name: 'slash_commands',
						value: 'scmds'
					},
					{
						name: 'commands',
						value: 'cmds'
					}
				],
				required: true
			}],
			usage: [
				"[value: bot] - Crash and restart the bot",
				"[value: slash_commands] - Reload all slash commands",
				"[value: commands] - Reload all commands"
			],
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		if(ctx.user.id !== this.#bot.owner) return "Only the bot owner can use this!";
		var arg = ctx.options.get('value').value.trim();
		
		switch(arg) {
			case 'bot':
				await ctx.reply('Rebooting!');
				process.exit(0);
			case 'scmds':
				await ctx.deferReply();
				await this.#bot.shard.broadcastEval((cli, {path}) => {
					cli.handlers.interaction.load(path)
					return true;
				}, {context: { path: __dirname + '/..'}})
				return 'Reloaded!'
			case 'cmds':
				await ctx.deferReply();
				await this.#bot.shard.broadcastEval((cli, {path}) => {
					cli.handlers.command.load(path)
					return true;
				}, {context: { path: __dirname + '/../../commands'}})
				return 'Reloaded!'
		}
	}
}

module.exports = (bot, stores) => new Command(bot, stores);