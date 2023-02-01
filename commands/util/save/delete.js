const { confBtns } = require('../../../extras');
const { Models: { SlashCommand } } = require('frame');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'delete',
			description: "Delete a saved color",
			options: [{
				name: 'name',
				description: "The color to delete",
				type: 3,
				required: true
			}],
			usage: [
				'[name] - Deletes the given saved color'
			],
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var name = ctx.options.getString('name').trim().toLowerCase();
		var c = await this.#stores.colors.get(ctx.user.id, name)
		if(!c) return "Color not found!";

		var m = await ctx.reply({
			content: "Are you sure you want to delete this color?",
			components: [{type: 1, components: confBtns}],
			fetchReply: true
		})

		var conf = await this.#bot.utils.getConfirmation(this.#bot, m, ctx.user);
		var msg;
		if(conf.msg) msg = conf.msg;
		else {
			await this.#stores.colors.delete(ctx.user.id, name);
			msg = "Color deleted!";
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

		return;
	}
}

module.exports = (bot, stores) => new Command(bot, stores);