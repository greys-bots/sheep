const { clearBtns } = require('../../extras');

module.exports = {
	data: {
		name: 'blacklist',
		description: "Manage the server's blacklist",
		type: 2
	},
	permissions: ['MANAGE_GUILD'],
	guildOnly: true
}

var opts = module.exports.options = [];

opts.push({
	data: {
		name: 'view',
		description: "View the server's blacklist",
		type: 1
	},
	usage: [
		"- View the current server blacklist"
	],
	async execute(ctx) {
		var cfg = await ctx.client.stores.usages.get(ctx.guild.id);
		if(!cfg?.blacklist?.length) return "Nothing blacklisted!";
		if(cfg.type == 1) return "Config set to whitelist mode!";

		var roles = [];
		var users = [];
		var groles = await ctx.guild.roles.fetch();
		for(var item of cfg.blacklist) {
			try {
				var role = groles.find(r => r.id == item);
				if(role) {
					roles.push(role.toString());
					continue;
				}
			} catch(e) { }

			try {
				var user = await ctx.client.users.fetch(item);
				if(user) users.push(user.toString());
			} catch(e) { }
		}

		return {embeds: [{
			title: "Blacklist",
			description:
				`**Roles:**\n` +
				(roles.join("\n") || "(none)") +
				`\n\n**Users**\n` +
				(users.join("\n") || "(none)")
		}]}
	}
})

opts.push({
	data: {
		name: 'add',
		description: "Add to the server's blacklist",
		type: 1,
		options: [{
			name: 'target',
			description: "A user or role to add to the blacklist",
			type: 9,
			required: true
		}]
	},
	usage: [
		'[target] - Adds the given target to the blacklist'
	],
	async execute(ctx) {
		var cfg = await ctx.client.stores.usages.get(ctx.guild.id);
		var target = ctx.options.getMentionable('target');

		var blacklist = cfg?.blacklist ?? [];
		if(!blacklist.includes(target.id)) blacklist.push(target.id);

		await ctx.client.stores.usages[cfg ? "update" : "create"](ctx.guild.id, {blacklist});
		return "Config updated!";
	}
})

opts.push({
	data: {
		name: 'remove',
		description: "Remove from the server's blacklist",
		type: 1,
		options: [{
			name: 'target',
			description: "A user or role to remove from the blacklist",
			type: 9,
			required: true
		}]
	},
	usage: [
		'[target] - Removes the given target from the blacklist'
	],
	async execute(ctx) {
		var cfg = await ctx.client.stores.usages.get(ctx.guild.id);
		if(!cfg?.blacklist?.length) return "Nothing to remove!";
		var target = ctx.options.getMentionable('target');

		var blacklist = cfg.blacklist.filter(x => x != target.id);

		await ctx.client.stores.usages.update(ctx.guild.id, {blacklist});
		return "Config updated!";
	}
})

opts.push({
	data: {
		name: 'clear',
		description: "Clear the server's blacklist",
		type: 1
	},
	usage: ['- Clear the current blacklist'],
	async execute(ctx) {
		var cfg = await ctx.client.stores.usages.get(ctx.guild.id);
		if(!cfg?.blacklist?.length) return "Nothing to clear!";

		var m = await ctx.reply({
			content: "Are you sure you want to clear the blacklist?",
			components: [{type: 1, components: clearBtns}],
			fetchReply: true
		})
		var conf = await ctx.client.utils.getConfirmation(ctx.client, m, ctx.user);

		var msg;
		if(conf.msg) msg = conf.msg;
		else {
			await ctx.client.stores.usages.update(ctx.guild.id, {blacklist: []});
			msg = "Blacklist cleared!";
		}

		var reply = {
			content: msg,
			components: []
		}
		
		if(conf.interaction) {
			await conf.interaction.update(reply)
			return;
		}

		return reply;
	}
})

opts.push({
	data: {
		name: 'enable',
		description: "Enable the server's blacklist",
		type: 1
	},
	usage: ['- Enables the blacklist'],
	async execute(ctx) {
		var cfg = await ctx.client.stores.usages.get(ctx.guild.id);

		await ctx.client.stores[cfg ? "update" : "create"](ctx.guild.id, {type: 2});
		return "Config updated!";
	}
})

opts.push({
	data: {
		name: 'disable',
		description: "Disable the server's blacklist",
		type: 1
	},
	usage: ['- Disables the blacklist'],
	async execute(ctx) {
		var cfg = await ctx.client.stores.usages.get(ctx.guild.id);

		await ctx.client.stores[cfg ? "update" : "create"](ctx.guild.id, {type: 0});
		return "Config updated!";
	}
})