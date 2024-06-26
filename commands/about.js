const { Models: { SlashCommand } } = require('frame');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: "about",
			description: "Info about the bot",
			usage: [
				"- Gives info about the bot"
			],
			ephemeral: true
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var guilds = (await this.#bot.shard.broadcastEval(cli => cli.guilds.cache.size)).reduce((prev, val) => prev + val, 0);
		var users = (await this.#bot.shard.broadcastEval(cli => cli.users.cache.size)).reduce((prev, val) => prev + val, 0);

		return {
			embeds: [{
				title: '**About**',
				description: "Baa! I'm Sheep! I help people change their name color here on Discord.\nMy prefixes are `s!`, `sh!`, `sheep!`, and `baa!`",
				fields:[
					{name: "Creators", value: "[greysdawn](https://github.com/greysdawn) | @greysdawn"},
					{name: "Invite", value: "[Clicky!](https://discordapp.com/api/oauth2/authorize?client_id=585271178180952064&permissions=268462080&scope=bot)",inline: true},
					{name: "Stats", value: `Guilds: ${guilds} | Users: ${users}`},
					{name: "Other Links", value: "[Repo](https://github.com/greys-bots/sheep) | [Website](https://sheep.greysdawn.com/)"}
				]
			}],
			components: [{
				type: 1,
				components: [
					{
						type: 2,
						style: 5,
						label: "Support server",
						url: "https://discord.gg/EvDmXGt"
					},
					{
						type: 2,
						style: 5,
						label: "Patreon",
						url: "https://patreon.com/greysdawn"
					},
					{
						type: 2,
						style: 5,
						label: "Ko-Fi",
						url: "https://patreon.com/greysdawn"
					}
				]
			}]
		}
	}
}

module.exports = (bot, stores) => new Command(bot, stores);