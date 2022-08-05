const MODES = [
	'user-based',
	'server-based'
]

module.exports = {
	data: {
		name: 'toggle',
		description: "Toggle the server's role mode"
	},
	usage: ['- Set the role mode for the server'],
	extra: `"Role mode" refers to whether roles are created per-user or are global for the server`,
	async execute(ctx) {
		var cfg = await ctx.client.stores.configs.get(ctx.guild.id);
		var mode = (cfg?.role_mode ?? 0) == 0 ? 1 : 0;
		console.log(mode);

		if(cfg) await ctx.client.stores.configs.update(ctx.guild.id, {role_mode: mode});
		else await ctx.client.stores.configs.create(ctx.guild.id, {role_mode: mode});

		return `Mode toggled! New setting: ${MODES[mode]} roles`;
	}
}