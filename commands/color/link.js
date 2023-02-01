const { confBtns } = require('../../extras');
const { Models: { SlashCommand } } = require('frame');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'link',
			description: "Link your role with another person",
			options: [{
				name: 'user',
				description: 'The user to link with',
				type: 6,
				required: true
			}],
			usage: [
				'[user] - Link roles with another user'
			],
			extra: "Linking roles means that the color can be changed by either account",
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var cfg = await this.#stores.configs.get(ctx.guild.id);
		if(cfg && cfg.role_mode == 1) return "Can't link colors in server-based color mode!";

		var role = await this.#stores.userRoles.get(ctx.guild.id, ctx.user.id);
		if(!role) return "You don't have a role to link!";

		var user = ctx.options.getMember('user');
		if(user.id == ctx.user.id) return "Baaa! You can't link roles with yourself, silly!";
		var msg = await ctx.reply({
			content: `<@${user.id}>, please confirm you'd like to link roles!`,
			components: [{
				type: 1,
				components: confBtns
			}],
			fetchReply: true
		});

		var conf = await this.#bot.utils.getConfirmation(this.#bot, msg, user);

		var msg;
		if(conf.msg) msg = conf.msg;
		else {
			var existing = await this.#stores.userRoles.get(ctx.guild.id, user.id);
			if(existing) await this.#stores.userRoles.delete(ctx.guild.id, user.id);

			await this.#stores.userRoles.create(ctx.guild.id, user.id, role.role_id);
			await user.roles.add(role.role_id);
			msg = "Roles linked!";
		}

		if(conf.interaction) {
			await conf.interaction.update({
				content: msg,
				components: [{
					type: 1,
					components: confBtns.map(c => {
						return {...c, disabled: true}
					})
				}]
			})
		} else {
			await ctx.editReply({
				content: msg,
				components: [{
					type: 1,
					components: confBtns.map(c => {
						return {...c, disabled: true}
					})
				}]
			})
		}

		return;
	}
}

module.exports = (bot, stores) => new Command(bot, stores);