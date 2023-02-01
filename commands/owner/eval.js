const { Models: { SlashCommand } } = require('frame');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'eval',
			description: "Evaluate javascript code",
			options: [{
				name: 'code',
				description: "The code to evaluate",
				type: 3,
				required: true
			}],
			usage: [
				'[code] - Eval the given code'
			]
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		if(ctx.user.id !== this.#bot.owner) return "Only the bot owner can use this!";
		
		var code = ctx.options.getString('code');

		try {
			let evld = await eval(code);
			if(typeof(evld) !== "string") evld = require("util").inspect(evld);
			return evld;
		} catch (err) {
			if(err) console.log(err);
			return err.message ?? err;
		}
	}
}

module.exports = (bot, stores) => new Command(bot, stores);