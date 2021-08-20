const tc = require('tinycolor2');

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

const BG_COLORS = {
	dark: `36393f`,
	light: `ffffff`
}

function getA11y(color) {
	var text = [];
	for(var k in BG_COLORS) {
		var c = tc(BG_COLORS[k]);
		var readable = tc.isReadable(color, c);
		if(readable) text.push(`✅ this color is readable on ${k} mode`);
		else text.push(`❌ this color might not be readable on ${k} mode`);
	}

	return text;
}

module.exports = {
	data: {
		name: 'change',
		description: "Change your color",
		options: [
			{
				name: 'color',
				description: "The color you want",
				type: 3,
				required: false
			}
		]
	},
	usage: [
		'- Generate a random color to change to',
		'[color] - Change to a specific color'
	],
	extra: "This command accepts hex codes and color names!\n" +
	       "See [this](https://www.w3schools.com/colors/colors_names.asp) " 
	       "link for supported names",
	async execute(ctx) {
		var cfg = await ctx.client.stores.configs.get(ctx.guildId);
		if(!cfg) cfg = {role_mode: 0};

		var ucfg = await ctx.client.stores.userConfigs.get(ctx.user.id);
		if(!ucfg) ucfg = {auto_rename: 0};

		var arg = ctx.options.getString('color', false)?.trim().toLowerCase();
		if(!cfg.role_mode) {
			var color, saved;
			if(!arg) color = tc.random();
			else {
				saved = await ctx.client.stores.colors.get(ctx.user.id, arg);
				if(saved) color = tc(saved.color);
				else color = tc(arg)
			}

			if(!color.isValid()) return "That color isn't valid :("
			if(color.toHex() == "000000") color = tc('001');

			var a11y = getA11y(color);
			if(cfg.readable && a11y.find(a => a.includes('not')))
				return "This server requires readable colors! This color's info:\n" + a11y.join('\n');

			
		}
	}
}