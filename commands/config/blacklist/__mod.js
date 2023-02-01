const { Models: { SlashCommand } } = require('frame');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'blacklist',
			description: "Commands to configure the usage blacklist",
			type: 2,
			permissions: ['ManageGuild'],
			guildOnly: true
		})
		this.#bot = bot;
		this.#stores = stores;
	}
}

module.exports = (bot, stores) => new Command(bot, stores);