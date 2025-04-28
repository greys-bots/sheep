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
			v2: true
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
		return [{
			components: [{
				type: 17,
				accent_color: parseInt(color.toHex(), 16),
				components: [
					{
						type: 10,
						content: `# Current color: ${color.toHexString()}`
					},
					{
						type: 12,
						items: [{
							media: {
								url: `https://sheep.greysdawn.com/sheep/${color.toHex()}`
							}
						}]
					}
				]
			}]
		}]
	}
}

module.exports = (bot, stores) => new Command(bot, stores);