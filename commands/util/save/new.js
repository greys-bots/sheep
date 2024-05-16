const tc = require('tinycolor2');
const { confBtns } = require('../../../extras');
const { Models: { SlashCommand } } = require('frame');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'new',
			description: "Save a new color",
			options: [
				{
					name: 'name',
					description: "The name of the color",
					type: 3,
					required: true
				},
				{
					name: 'color',
					description: "The color value to save",
					type: 3,
					required: true
				}
			],
			usage: [
				'[name] [color] - Saves a color with the given name and value'
			],
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var name = ctx.options.getString('name').trim();
		var color = ctx.options.getString('color').trim();
		var prem = await this.#bot.handlers.premium.checkAccess(ctx.user.id);

		var conf;
		var count = await this.#stores.colors.getAll(ctx.user.id);
		if(count?.length > 10) {
			if(!prem.access) return (
				"You don't have room for any more saved colors :(\n" +
				"Subscribe to premium to get more space!"
			)
		}
		var exists = await this.#stores.colors.get(ctx.user.id, name.toLowerCase());
		if(exists?.id) {
			var m = await ctx.reply({
				content: "Color with that name already saved! Do you want to override it?",
				components: [{type: 1, components: confBtns}],
				fetchReply: true
			});
			conf = await this.#bot.utils.getConfirmation(this.#bot, m, ctx.user);
			if(conf.msg) return conf.msg;
		}
		
		color = tc(color);
		if(!color.isValid()) return "That color isn't valid!";
		color = color.toHex();

		if(exists) {
			exists.color = color;
			await exists.save();
		} else await this.#stores.colors.create(ctx.user.id, name, {color});

		var msg = 'Color saved!';
		if(!prem.access) msg = ` Slots used: ${count + 1}`;
		return msg;
	}
}

module.exports = (bot, stores) => new Command(bot, stores);