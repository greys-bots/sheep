const axios = require('axios');
const { confBtns } = require('../../extras');

module.exports = {
	data: {
		name: 'import',
		description: "Import saved colors from a file",
		options: [{
			name: 'url',
			description: "The URL of the file to import",
			type: 3,
			required: true
		}]
	},
	usage: [
		'[url] - Imports colors from the given url'
	],
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

			var conf = await ctx.client.utils.getConfirmation(ctx.client, m, ctx.user);
			var msg;
			if(conf.msg) msg = conf.msg;
			else {
				var dat = await ctx.client.stores.colors.import(ctx.user.id, data);
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