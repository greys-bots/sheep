const axios = require('axios');
const { confBtns } = require('../../extras');
const { Models: { SlashCommand } } = require('frame');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'import',
			description: "Import saved colors from a file",
			options: [{
				name: 'url',
				description: "The URL of the file to import",
				type: 3,
				required: true
			}],
			usage: [
				'[url] - Imports colors from the given url'
			],
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var url = ctx.options.getString('url');

		try {
			var req = await axios.get(url);
			var data = req.data;
			if(!data || typeof data != 'object')
				return "Please link a valid .json file!";

			var prem = await this.#bot.handlers.premium.checkAccess(ctx.user.id);

			var m = await ctx.reply({
				content: "WARNING: This will overwrite your existing data. " +
						 "Are you sure you want to import these colors?" +
						 (
						 	!prem.access ?
						 	("\nNOTE: If you have 10 or more saved colors, " +
						 	"this will only update your existing ones") :
							""
						 ),
				components: [{type: 1, components: confBtns}],
				fetchReply: true
			})

			var conf = await this.#bot.utils.getConfirmation(this.#bot, m, ctx.user);
			if(conf.msg) return conf.msg;
			
			var dat = await this.#stores.colors.import(ctx.user.id, data, prem.access);
			return (
				"Colors imported! Results:\n" +
				`Created: ${dat.created}\n` +
				`Updated: ${dat.updated}\n`
			);
		} catch(e) {
			await ctx[ctx.replied ? "followUp" : "reply"]({
				content: "ERR: " + (e.message ?? e),
				ephemeral: true
			})
		}

		return;
	}
}

module.exports = (bot, stores) => new Command(bot, stores);