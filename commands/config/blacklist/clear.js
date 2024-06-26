const { clearBtns } = require('../../../extras');
const { Models: { SlashCommand } } = require('frame');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'clear',
			description: "Clear the server's blacklist",
			usage: [
				'- Clear the current blacklist'
			],
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var cfg = await this.#stores.usages.get(ctx.guild.id);
		if(!cfg?.blacklist?.length) return "Nothing to clear!";

		var m = await ctx.reply({
			content: "Are you sure you want to clear the blacklist?",
			components: [{type: 1, components: clearBtns}],
			fetchReply: true
		})
		var conf = await this.#bot.utils.getConfirmation(this.#bot, m, ctx.user);

		var msg;
		if(conf.msg) return conf.msg;
		
		cfg.blacklist = [];
		await cfg.save();
		return "Blacklist cleared!";
	}
}

module.exports = (bot, stores) => new Command(bot, stores);