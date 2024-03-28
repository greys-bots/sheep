const tc = require('tinycolor2');
const { Models: { SlashCommand } } = require('frame');

const CHOICES = [
	{
		name: "yes",
		accepted: ['yes', 'y', '✅']
	},
	{
		name: 'no',
		accepted: ['no', 'n', '❌'],
		msg: 'Action cancelled!'
	},
	{
		name: 'random',
		accepted: ['random', 'r', '🔀']
	}
]

const BUTTONS = [
	{
		type: 2,
		style: 3,
		label: 'Confirm',
		emoji: '✅',
		custom_id: 'yes'
	},
	{
		type: 2,
		style: 4,
		label: 'Cancel',
		emoji: '❌',
		custom_id: 'no'
	},
	{
		type: 2,
		style: 1,
		label: 'Random',
		emoji: '🔀',
		custom_id: 'random'
	}
]

const BG_COLORS = {
	dark: `36393f`,
	light: `ffffff`
}

function getA11y(color) {
	var text = [];
	for(var k in BG_COLORS) {
		var c = tc(BG_COLORS[k]);
		var rd = tc.readability(color, c);
		if(rd > 2) text.push(`✅ this color is readable on ${k} mode`);
		else text.push(`❌ this color might not be readable on ${k} mode`);
	}

	return text;
}

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'change',
			description: "Change your color",
			options: [
				{
					name: 'color',
					description: "The color you want",
					type: 3,
					required: false
				}
			],
			usage: [
				'- Generate a random color to change to',
				'[color] - Change to a specific color'
			],
			extra: "This command accepts hex codes and color names!\n" +
			       "See [this](https://www.w3schools.com/colors/colors_names.asp) " +
			       "link for supported names",
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var cfg = await this.#stores.configs.get(ctx.guild.id);
		if(!cfg) cfg = {role_mode: 0};

		var ucfg = await this.#stores.userConfigs.get(ctx.user.id);
		if(!ucfg) ucfg = {auto_rename: 0};

		var arg = ctx.options.getString('color', false)?.trim().toLowerCase();
		if(!cfg.role_mode) {
			var color, saved;
			if(!arg) color = tc.random();
			else {
				saved = await this.#stores.colors.get(ctx.user.id, arg);
				if(saved) color = tc(saved.color);
				else color = tc(arg)
			}

			if(!color.isValid()) return "That color isn't valid :("
			if(color.toHex() == "000000") color = tc('001');

			var a11y = getA11y(color);
			if(cfg.readable && a11y.find(a => a.includes('not')))
				return "This server requires readable colors! This color's info:\n" + a11y.join('\n');

			var message = await ctx.reply({
				embeds: [{
					title: "Color "+color.toHexString().toUpperCase(),
					image: {
						url: `https://sheep.greysdawn.com/sheep/${color.toHex()}`
					},
					color: parseInt(color.toHex(), 16),
					footer: {
						text: ucfg.a11y ? a11y.join(" | ") : ""
					}
				}],
				components: [{
					type: 1,
					components: BUTTONS
				}],
				fetchReply: true
			});

			var done = false;
			var member = ctx.member;
			var timeout = setTimeout(async ()=> {
				done = true;
				await message.edit('Action timed out', {embeds: [], components: []});
			}, 3 * 60 * 1000);
			while(!done) {
				var choice = await this.#bot.utils.handleChoices(this.#bot, message, ctx.user, CHOICES);

				switch(choice.name) {
					case 'yes':
						done = true;
						clearTimeout(timeout);

						var role = await this.#stores.userRoles.get(ctx.guild.id, ctx.user.id);
						var srole;
						if(cfg.hoist) srole = await ctx.guild.roles.fetch(cfg.hoist);
						else srole = ctx.guild.members.me.roles.cache.find(r => r.name.toLowerCase().includes("sheep") || r.managed);
						var name;
						if(ucfg.auto_rename && saved?.name) name = saved.name;
						else name = (role?.raw?.name ?? ctx.user.username);
						
						var options = {
							name,
							color: color.toHex(),
							position: srole ? srole.position - 1 : 0,
							mentionable: cfg.pingable,
							permissions: 0n
						}

						try {
							if(role && !role.raw?.deleted) {
								console.log(role.raw.position);
								role = await role.raw.edit(options);
							} else {
								role = await ctx.guild.roles.create(options);
								await this.#stores.userRoles.create(ctx.guild.id, member.id, role.id);
							}
							await member.roles.add(role.id);

							var m = "Color successfully changed to "+color.toHexString()+"! :D";
							if(ucfg.a11y) m += "\nAccessibility info:\n" + a11y.join("\n");

							if(choice.interaction) {
								await choice.interaction.update({content: m, embeds: [], components: []});
							} else await ctx.editReply({content: m, embeds: [], components: []});
							if(choice.react) await choice.react.users.remove(member.id);
							if(choice.message) await choice.message.delete();
						} catch(e) {
							console.log(e.stack);
							return [
								`Something went wrong! ERR: ${e.message}\n`,
								`Try moving my highest role above any roles you're trying to color, then try again!\n`,
								`If the error continues, please report this in `,
								`my development server: https://discord.gg/EvDmXGt`
							].join("");
						}
						break;
					case 'random':
						var color = tc.random();
						if(choice.interaction) {
							await choice.interaction.update({embeds: [{
								title: "Color "+color.toHexString().toUpperCase(),
								image: {
									url: `https://sheep.greysdawn.com/sheep/${color.toHex()}`
								},
								color: parseInt(color.toHex(), 16),
								footer: {
									text: `${color.toRgbString()}`
								}
							}]})
						} else {
							await ctx.editReply({embeds: [{
								title: "Color "+color.toHexString().toUpperCase(),
								image: {
									url: `https://sheep.greysdawn.com/sheep/${color.toHex()}`
								},
								color: parseInt(color.toHex(), 16),
								footer: {
									text: `${color.toRgbString()}`
								}
							}]})
						}

						if(choice.react) await choice.react.users.remove(member.id);
						else if(choice.message) await choice.message.delete();
						clearTimeout(timeout);
						timeout = setTimeout(async ()=> {
							done = true;
							await ctx.editReply({content: 'Action timed out', embeds: [], components: []});
							await message.reactions.removeAll();
						}, 3 * 60 * 1000);
						break;
					default:
						ctx.editReply({content: "Action cancelled", embeds: [], components: []});
						message.reactions.removeAll();
						done = true;
						clearTimeout(timeout);
						break;
				}
			}

			return;
		} else {
			var role = await ctx.guild.roles.cache.find(r => r.name.toLowerCase() == arg);
			if(!role) return "Role not found";

			role = await this.#stores.serverRoles.get(ctx.guild.id, role.id);
			if(!role) return "Server role not found";

			var roles = await this.#stores.serverRoles.getAll(ctx.guild.id);
			if(!roles || !roles[0]) return "Couldn't get role list :(";

			for(var rl of roles) {
				if(ctx.member.roles.cache.find(r => r.id == rl.role_id)) {
					try {
						await ctx.member.roles.remove(rl.role_id);
					} catch(e) {
						console.log(e.stack);
						return "ERR: "+e.message;
					}
				}
			}		

			try {
				await ctx.member.roles.add(role.role_id);
			} catch(e) {
				console.log(e.stack);
				return "ERR: "+e.message;
			}
			
			return "Added!"
		}
	}
}

module.exports = (bot, stores) => new Command(bot, stores);