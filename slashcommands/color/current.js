const tc = require('tinycolor2');

module.exports = {
	data: {
		name: 'current',
		description: "Get your current role color"
	},
	usage: ["- Shows your current role's color"],
	async execute(ctx) {
		var role = await ctx.client.stores.userRoles.get(ctx.guild.id, ctx.user.id);
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
			footer: color.toRgbString()
		}]}
	}
}