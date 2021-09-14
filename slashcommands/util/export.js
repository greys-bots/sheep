module.exports = {
	data: {
		name: 'export',
		description: "Export your saved colors",
		options: [{
			name: 'color',
			description: "A specific color to export",
			type: 3,
			required: false
		}]
	},
	usage: [
		'- Export your saved colors',
		'[color] - Export a specific color'
	],
	async execute(ctx) {
		var color = ctx.options.getString('color', false);
		var data = await ctx.client.stores.colors.export(ctx.user.id, color);

		if(ctx.channel.type !== 'DM') {
			await ctx.user.send({
				content: "Here's your file!",
				files: [{
					attachment: Buffer.from(JSON.stringify(data)),
					name: 'saved_colors.json'
				}]
			})
			return {content: "Check your DMs!", ephemeral: true};
		} else {
			return {
				content: "Here's your file!",
				files: [{
					attachment: Buffer.from(JSON.stringify(data)),
					name: 'saved_colors.json'
				}]
			}
		}
	}
}