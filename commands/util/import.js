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

			var m = await ctx.reply({
				content: "WARNING: This will overwrite your existing data. " +
						 "Are you sure you want to import these colors?",
				components: [{type: 1, components: confBtns}],
				fetchReply: true
			})

			var conf = await this.#bot.utils.getConfirmation(this.#bot, m, ctx.user);
			var msg;
			if(conf.msg) msg = conf.msg;
			else {
				var dat = await this.#stores.colors.import(ctx.user.id, data);
				msg = (
					"Colors imported! Results:\n" +
					`Created: ${dat.created}\n` +
					`Updated: ${dat.updated}\n`
				);
			}

			if(conf.interaction) {
				await conf.interaction.update({
					content: msg,
					components: [{type: 1, components: confBtns.map((b) => {
						return {...b, disabled: true}
					})}]
				})
			} else {
				await conf.editReply({
					content: msg,
					components: [{type: 1, components: confBtns.map((b) => {
						return {...b, disabled: true}
					})}]
				})
			}
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