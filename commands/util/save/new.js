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

		var conf;
		var exists = await this.#stores.colors.get(ctx.user.id, name.toLowerCase());
		if(exists) {
			var m = await ctx.reply({
				content: "Color with that name already saved! Do you want to override it?",
				components: [{type: 1, components: confBtns}],
				fetchReply: true
			});
			conf = await this.#bot.utils.getConfirmation(this.#bot, m, ctx.user);
			if(conf.msg) {
				if(conf.interaction) await conf.interaction.update({
					content: conf.msg,
					components: []
				});
				else await ctx.editReply({
					content: conf.msg,
					components: []
				});
				return;
			}
		}
		
		color = tc(color);
		if(!color.isValid()) return "That color isn't valid!";
		color = color.toHex();

		if(exists) await this.#stores.colors.update(ctx.user.id, name.toLowerCase(), {color});
		else await this.#stores.colors.create(ctx.user.id, name, {color});

		if(conf?.interaction) await conf.interaction.update({
			content: 'Color saved!',
			components: []
		});
		else await ctx[ctx.replied ? "editReply" : "reply"]({
			content: 'Color saved!',
			components: []
		});

		return;
	}
}

module.exports = (bot, stores) => new Command(bot, stores);