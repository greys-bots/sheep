const tc = require('tinycolor2');
const { Models: { SlashCommand } } = require('frame');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'current',
			description: "Get your current role color",
			usage: [
				"- Shows your current role's color"
			],
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var role = await this.#stores.userRoles.get(ctx.guild.id, ctx.user.id);
		if(!role?.raw) return "You don't have a color role!";
		if(!role.raw.color) return "Role has no color!";

		var color = ("000000" + role.raw.color.toString(16)).slice(-6);
		color = tc(color);
		return {embeds: [{
			title: 'Current Color: '+color.toHexString(),
			image: {
				url: `https://sheep.greysdawn.com/sheep/${color.toHex()}`
			},
			color: parseInt(color.toHex(), 16),
			footer: { text: color.toRgbString() }
		}]}
	}
}

module.exports = (bot, stores) => new Command(bot, stores);