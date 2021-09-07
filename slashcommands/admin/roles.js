const tc = require('tinycolor2');

module.exports = {
	data: {
		name: 'roles',
		description: 'Manage color roles in the server',
		type: 2
	},
	options: [],
	guildOnly: true,
	permissions: ['MANAGE_ROLES']
}

var opts = module.exports.options;

opts.push({
	data: {
		name: 'view',
		description: "View the server's color roles",
		type: 1,
		options: [{
			name: 'role',
			description: "A specific role to view",
			type: 8,
			required: false
		}]
	},
	usage: [
		"- List all color roles indexed in the server",
		"[role] - View a specific role to see if it's indexed"
	],
	async execute(ctx) {
		var rl = ctx.options.getRole('role', false);

		var roles = await ctx.client.stores.serverRoles.getAll(ctx.guildId);
		if(!roles || !roles[0]) return "No indexed roles";
		if(rl) roles = roles.filter(r => r.role_id == rl.id);
		if(!roles.length) return "That role isn't indexed!";

		var embeds = roles.map(r => {
			var c = r.raw.color?.toString(16).toUpperCase();
			return {
				title: r.raw.name,
				description: `Color: ${c ?? "(no color)" }\nPreview: <@&${r.role_id}>`,
				color: r.raw.color,
				image: {url: `https://sheep.greysdawn.com/sheep/${c}`}
			}
		})

		if(embeds.length > 1) for(var i = 0; i < embeds.length; i++) embeds[i].title += ` (${i+1}/${embeds.length})`;

		return embeds;
	},
	permissions: [],
	ephemeral: true
})

opts.push({
	data: {
		name: 'create',
		description: "Create a new server-based role",
		type: 1,
		options: [
			{
				name: 'name',
				description: "The role's name",
				type: 3,
				required: true
			},
			{
				name: 'color',
				description: "The color of the role",
				type: 3,
				required: true
			}
		]
	},
	usage: [
		'[role] [color] - Create a new role for usage with server-based colors'
	],
	extra: "If you want to use an existing role, use the `index` command instead",
	async execute(ctx) {
		var name = ctx.options.getString('name');
		var color = ctx.options.getString('color');
		color = tc(color);
		if(!color.isValid()) return "That color isn't valid!";
		color = color.toHex().toLowerCase();
		if(name.length > 100) return "Names must be 100 characters or less!";
		if(color == '000000') color = parseInt('000001', 16);
		else color = parseInt(color, 16);

		await ctx.deferReply();
		var role = await ctx.guild.roles.create({name, color});
		await ctx.client.stores.serverRoles.create(ctx.guildId, role.id);
		return "Role created!";
	}
})

opts.push({
	data: {
		name: 'index',
		description: "Index an existing role to use for server-based colors",
		type: 1,
		options: [{
			name: 'role',
			description: "The role to index",
			type: 8,
			required: true
		}]
	},
	usage: [
		'[role] - Indexes the given role'
	],
	extra: "If you want to create a new role, use the `create` command instead",
	async execute(ctx) {
		var role = ctx.options.getRole('role');

		var existing = await ctx.client.stores.serverRoles.get(ctx.guildId, role.id);
		if(existing) return "That role is already indexed!";

		await ctx.client.stores.serverRoles.create(ctx.guildId, role.id);
		return "Role indexed!";
	}
})

opts.push({
	data: {
		name: 'remove',
		description: "Remove a server-based role, deleting it from the database",
		type: 1,
		options: [
			{
				name: 'role',
				description: "The role to remove from the database",
				type: 8,
				required: true
			},
			{
				name: 'delete',
				description: "Whether the role being removed should be deleted",
				type: 5,
				required: false
			}
		]
	},
	usage: ["[role] - Removes the given role from the server's role list"],
	async execute(ctx) {
		var role = ctx.options.getRole('role');
		var del = ctx.options.getBoolean('delete', false);
		var exists = await ctx.client.stores.serverRoles.get(ctx.guildId, role.id);
		if(!exists) return "Role not indexed!";

		try {
			await ctx.client.stores.serverRoles.delete(ctx.guildId, role.id);
			if(del) await role.delete();
		} catch(e) {
			return "ERR: "+e;
		}

		return "Role removed!";
	}
})

opts.push({
	data: {
		name: 'edit',
		description: "Edit a role's name or color",
		type: 1,
		options: [
			{
				name: 'role',
				description: "The role to edit",
				type: 8,
				required: true
			},
			{
				name: 'option',
				description: "The option to edit",
				type: 3,
				required: true,
				choices: [
					{
						name: 'name',
						value: 'name'
					},
					{
						name: 'color',
						value: 'color'
					}
				]
			},
			{
				name: 'value',
				description: "The new value",
				type: 3,
				required: true
			}
		]
	},
	usage: [
		'[role] [option: name] [value: new name] - Change the name of a role',
		'[role] [option: color] [value: new color] - Change the color of a role'
	],
	async execute(ctx) {
		var role = ctx.options.getRole('role');
		var option = ctx.options.getString('option');
		var value = ctx.options.getString('value');

		switch(option) {
			case 'name':
				if(value.length > 100) return "Name must be 100 characters or less!";
				break;
			case 'color':
				var c = tc(value);
				if(!c.isValid()) return "Color must be valid!";
				value = parseInt(c.toHex(), 16);
				break;
		}

		var resp = await role.edit({[option]: value});
		return "Role edited!";
	}
})

opts.push({
	data: {
		name: 'reset',
		description: "Remove all server-based roles from the database, optionally deleting their associated roles",
		type: 1,
		options: [{
			name: 'delete',
			description: "Whether the roles should be deleted or not",
			type: 5,
			required: false
		}]
	},
	usage: [
		"- Remove all server roles from the database, leaving the associated roles intact",
		"[delete: true] - Removes all server roles from the database, deleting the associated roles from the guild"
	],
	async execute(ctx) {
		var del = ctx.options.getBoolean('delete', false);

		var roles = await ctx.client.stores.serverRoles.getAll(ctx.guildId);
		if(!roles?.length) return "No server roles indexed!";

		var err = false;
		if(del) {
			await ctx.deferReply();
			for(var role of roles) {
				try {
					await role.raw.delete();
				} catch(e) {
					err = true;
				}
			}
		}

		await ctx.client.stores.serverRoles.deleteAll(ctx.guildId);

		if(err) return "Some roles couldn't be deleted; you'll have to manually delete the rest!";
		else if(del) return "Roles deleted!";
		else return "Roles removed from the database!";
	}
})