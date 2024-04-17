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
				required: true,
				autocomplete: true
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
		if(conf.msg) return conf.msg;

		await c.delete();
		return "Color deleted!";
	}

	async auto(ctx) {
		var colors = await this.#stores.colors.getAll(ctx.user.id);
		var foc = ctx.options.getFocused();
		if(!foc) return colors.map(c => ({ name: c.name, value: c.name }));
		foc = foc.toLowerCase()

		if(!colors?.length) return [];

		return colors.filter(c =>
			c.color.includes(foc) ||
			c.name.toLowerCase().includes(foc)
		).map(c => ({
			name: c.name,
			value: c.name
		}))
	}
}

module.exports = (bot, stores) => new Command(bot, stores);