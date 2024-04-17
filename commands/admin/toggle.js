const MODES = [
	'user-based',
	'server-based'
]
const { Models: { SlashCommand } } = require('frame');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'toggle',
			description: "Toggle the server's role mode",
			usage: [
				'- Set the role mode for the server'
			],
			extra: `"Role mode" refers to whether roles are created per-user or are global for the server`,
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var cfg = await this.#stores.configs.get(ctx.guild.id);
		var mode = (cfg?.role_mode ?? 0) == 0 ? 1 : 0;
		console.log(mode);

		cfg.role_mode = mode;
		await cfg.save();

		return `Mode toggled! New setting: ${MODES[mode]} roles`;
	}
}

module.exports = (bot, stores) => new Command(bot, stores);