const tc = require('tinycolor2');
const { confBtns, clearBtns } = require('../../extras');

module.exports = {
	data: {
		name: 'save',
		description: "Manage saved colors",
		type: 2
	},
	options: []
}

var opts = module.exports.options;

opts.push({
	data: {
		name: 'view',
		description: "View your saved colors",
		type: 1,
		options: [{
			name: 'color',
			description: "A specific color to view",
			type: 3,
			required: false
		}]
	},
	usage: [
		'- View all saved colors',
		"[color] - View a specific saved color"
	],
	async execute(ctx) {
		var color = ctx.options.getString('color', false)?.trim().toLowerCase();
		var colors = await ctx.client.stores.colors.getAll(ctx.user.id);
		if(!colors?.[0]) return "No colors saved!";

		if(color) {
			var c = colors.find(cl => cl.name.toLowerCase() == color);
			if(!c) return "Color not found!";
			c = tc(c.color);

			return {embeds: [{
				title: `Color ${c.toHexString().toUpperCase()}`,
				image: { url: `https://sheep.greysdawn.com/sheep/${c.toHex()}` },
				color: parseInt(c.toHex(), 16)
			}]}
		}

		var embeds = await ctx.client.utils.genEmbeds(ctx.client, colors, c => {
			var cl = tc(c.color);
			return {
				name: c.name,
				value: cl.toHexString()
			}
		}, {
			title: 'Saved Colors'
		})

		return embeds.map(e => e.embed);
	},
	ephemeral: true
})

opts.push({
	data: {
		name: 'new',
		description: "Save a new color",
		type: 1,
		options: [
			{
				name: 'name',
				description: "The name of the color",
				type: 3,
				required: true
			},
			{
				name: 'color',
				description: "The color value to save",
				type: 3,
				required: true
			}
		]
	},
	usage: [
		'[name] [color] - Saves a color with the given name and value'
	],
	async execute(ctx) {
		var name = ctx.options.getString('name').trim();
		var color = ctx.options.getString('color').trim();

		var conf;
		var exists = await ctx.client.stores.colors.get(ctx.user.id, name.toLowerCase());
		if(exists) {
			var m = await ctx.reply({
				content: "Color with that name already saved! Do you want to override it?",
				components: [{type: 1, components: confBtns}],
				fetchReply: true
			});
			conf = await ctx.client.utils.getConfirmation(ctx.client, m, ctx.user);
			if(conf.msg) {
				if(conf.interaction) await conf.interaction.update({
					content: conf.msg,
					components: []
				});
				else await ctx.editReply({
					content: conf.msg,
					components: []
				});
				return;
			}
		}
		
		color = tc(color);
		if(!color.isValid()) return "That color isn't valid!";
		color = color.toHex();

		if(exists) await ctx.client.stores.colors.update(ctx.user.id, name, {color});
		else await ctx.client.stores.colors.create(ctx.user.id, name, {color});

		if(conf?.interaction) await conf.interaction.update({
			content: 'Color saved!',
			components: []
		});
		else await ctx[ctx.replied ? "editReply" : "reply"]({
			content: 'Color saved!',
			components: []
		});

		return;
	}
})

opts.push({
	data: {
		name: 'delete',
		description: "Delete a saved color",
		type: 1,
		options: [{
			name: 'name',
			description: "The color to delete",
			type: 3,
			required: true
		}]
	},
	usage: ['[name] - Deletes the given saved color'],
	async execute(ctx) {
		var name = ctx.options.getString('name').trim().toLowerCase();
		var c = await ctx.client.stores.colors.get(ctx.user.id, name)
		if(!c) return "Color not found!";

		var m = await ctx.reply({
			content: "Are you sure you want to delete this color?",
			components: [{type: 1, components: confBtns}],
			fetchReply: true
		})

		var conf = await ctx.client.utils.getConfirmation(ctx.client, m, ctx.user);
		var msg;
		if(conf.msg) msg = conf.msg;
		else {
			await ctx.client.stores.colors.delete(ctx.user.id, name);
			msg = "Color deleted!";
		}

		if(conf.interaction) {
			await conf.interaction.update({
				content: msg,
				components: [{type: 1, components: confBtns.map((b) => {
					return {...b, disabled: true}
				})}]
			})
		} else {
			await conf.editReply({
				content: msg,
				components: [{type: 1, components: confBtns.map((b) => {
					return {...b, disabled: true}
				})}]
			})
		}

		return;
	}
})

opts.push({
	data: {
		name: 'clear',
		description: "Delete ALL saved colors",
		type: 1
	},
	usage: ['- Deletes all saved colors'],
	async execute(ctx) {
		var m = await ctx.reply({
			content: "Are you sure you want to delete ALL saved colors?",
			components: [{type: 1, components: clearBtns}],
			fetchReply: true
		})

		var conf = await ctx.client.utils.getConfirmation(ctx.client, m, ctx.user);
		var msg;
		if(conf.msg) msg = conf.msg;
		else {
			await ctx.client.stores.colors.deleteAll(ctx.user.id);
			msg = "Colors deleted!";
		}

		if(conf.interaction) {
			await conf.interaction.update({
				content: msg,
				components: [{type: 1, components: clearBtns.map((b) => {
					return {...b, disabled: true}
				})}]
			})
		} else {
			await conf.editReply({
				content: msg,
				components: [{type: 1, components: clearBtns.map((b) => {
					return {...b, disabled: true}
				})}]
			})
		}

		return;
	}
})

opts.push({
	data: {
		name: 'edit',
		description: "Edit a saved color",
		type: 1,
		options: [
			{
				name: 'name',
				description: "The color to edit",
				type: 3,
				required: true
			},
			{
				name: 'prop',
				description: "The property to edit",
				type: 3,
				required: true,
				choices: [
					{
						name: "name",
						value: "name"
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
	usage: [],
	async execute(ctx) {
		var name = ctx.options.getString('name').trim().toLowerCase();
		var prop = ctx.options.getString('prop');
		var value = ctx.options.getString('value').trim();

		var color = await ctx.client.stores.colors.get(ctx.user.id, name);
		if(!color) return "Color not found!";
		
		switch(prop) {
			case 'name':
				var existing = await ctx.client.stores.colors.get(ctx.user.id, value.toLowerCase());
				if(existing && existing.id !== color.id) return "Saved color with that name already exists!";
				break;
			case 'color':
				var c = tc(value);
				if(!c.isValid()) return "That color isn't valid!";
				value = c.toHex()
				break;
		}

		await ctx.client.stores.colors.update(ctx.user.id, name, {[prop]: value});
		return "Color updated!";
	}
})