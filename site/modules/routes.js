const express 	= require('express');
const fs  		= require('fs');
const path 		= require('path');
const axios 	= require('axios');
const qs 		= require('qs');
const tc 		= require('tinycolor2');
const {inspect} = require('util');

var utils 	= {};

module.exports = async (app, manager) => {
	var files = fs.readdirSync(__dirname + "/../utils");
	for(var f of files) {
		Object.assign(utils, require(__dirname + "/../utils/"+f));
	}

	Object.assign(utils, require(__dirname + "/../../common/utils"));

	var {modules, mod_aliases, commands, aliases} = await utils.loadCommands(__dirname + "/../../common/commands");

	//get rid of any circular references
	//also convert collections to objects to avoid gross flattening
	modules = modules.map(m => {
		return {
            name: m.name,
            color: m.color,
            description: m.description,
            alias: m.alias,
            commands: m.commands.map(c => c.name)
        }
	});

	commands = commands.map(c => {
		return {
            name: c.name,
            help: c.help(),
            usage: c.usage().map(u => 's!' + c.name + u),
            desc: c.desc ? c.desc() : null,
            alias: c.alias,
            guildOnly: c.guildOnly,
            permissions: c.permissions,
            subcommands: c.subcommands ? c.subcommands.map(sc => {
                return {
                    name: sc.name,
                    help: sc.help(),
                    usage: sc.usage().map(u => 's!' + sc.name + u),
                    desc: sc.desc ? sc.desc() : null,
                    alias: sc.alias,
                    guildOnly: sc.guildOnly,
                    permissions: sc.permissions
                }
            }) : null
        }
	});

	commands.forEach((c, i) => commands[i].module = Object.assign({}, modules.find(m => m.commands.includes(c.name))));
	modules.forEach((m, i) => modules[i].commands = commands.filter(c => m.commands.includes(c.name)));

	var routes = [
		{
			protocol: "get",
			path: "/",
			function: async (req, res)=> {
				var index = fs.readFileSync(path.join(__dirname,'..','frontend','build','index.html'),'utf8');
				index = index.replace('$TITLE','Sheep')
							 .replace('$DESC','Homepage for a bot called Sheep')
							 .replace('$TWITDESC','Homepage for a bot called Sheep')
							 .replace('$TWITTITLE','Sheep')
							 .replace('$OGTITLE','Sheep')
							 .replace('$OGDESC','Homepage for a bot called Sheep')
							 .replace('$OEMBED','oembed.json');
				res.send(index);
			}
		},

		{
			protocol: "get",
			path: "/docs/*",
			function: async (req, res)=> {
				var index = fs.readFileSync(path.join(__dirname,'..','frontend','build','index.html'),'utf8');
				index = index.replace('$TITLE','Sheep Docs')
							 .replace('$DESC','Documentation for a bot called Sheep')
							 .replace('$TWITDESC','Documentation for a bot called Sheep')
							 .replace('$TWITTITLE','Sheep Docs')
							 .replace('$OGTITLE','Sheep Docs')
							 .replace('$OGDESC','Documentation for a bot called Sheep')
							 .replace('$OEMBED','oembed.json');
				res.send(index);
			}
		},

		{
			protocol: "get",
			path: "/dash/*",
			function: async (req, res)=> {
				var index = fs.readFileSync(path.join(__dirname,'..','frontend','build','index.html'),'utf8');
				index = index.replace('$TITLE','Sheep Dashboard')
							 .replace('$DESC','Dashboard for a bot called Sheep')
							 .replace('$TWITDESC','Dashboard for a bot called Sheep')
							 .replace('$TWITTITLE','Sheep Dashboard')
							 .replace('$OGTITLE','Sheep Dashboard')
							 .replace('$OGDESC','Dashboard for a bot called Sheep')
							 .replace('$OEMBED','oembed.json');
				res.send(index);
			}
		},

		{
			protocol: "get",
			path: "/gen",
			function: async (req, res)=> {
				var index = fs.readFileSync(path.join(__dirname,'..','frontend','build','index.html'),'utf8');
				index = index.replace('$TITLE','Sheep Generator')
							 .replace('$DESC','Sheep image generator')
							 .replace('$TWITDESC','Sheep image generator')
							 .replace('$TWITTITLE','Sheep Generator')
							 .replace('$OGTITLE','Sheep Generator')
							 .replace('$OGDESC','Sheep image generator')
							 .replace('$OEMBED','oembed.json');
				res.send(index);
			}
		},

		{
			protocol: "get",
			path: "/color/:col",
			function: async (req, res)=> {
				var img = await utils.createColorImage(req.params.col, req.query);
				res.type('png');
				res.write(img);
				res.end();
			}
		},

		{
			protocol: "get",
			path: '/sheep/:col',
			function: async (req, res)=> {
				var img = await utils.createSheepImage(req.params.col, req.query);
				res.type('png');
				res.write(img);
				res.end();
			}
		},

		{
			protocol: "get",
			path: '/api/modules',
			function: async (req, res)=> {
				res.send({modules});
			}
		},

		{
			protocol: "get",
			path: '/api/module/:module',
			function: async (req, res)=> {
				res.send(modules.find(m => m.name.toLowerCase() == mod_aliases.get(req.params.module.replace("-", " ").toLowerCase())));
			}
		},

		{
			protocol: "get",
			path: '/api/commands',
			function: async (req, res)=> {
				res.send({commands, modules});
			}
		},

		{
			protocol: "get",
			path: '/api/command/:cmd',
			function: async (req, res)=> {
				var cmd;
				if(req.params.cmd.includes("-")) {
					var split = req.params.cmd.split("-");
					cmd = commands.find(c => c.name == aliases.get(split[0].toLowerCase()));
				} else {
					cmd = commands.find(c => c.name == aliases.get(req.params.cmd.toLowerCase()));
				}

				res.send(cmd);
			}
		},

		{
			protocol: "get",
			path: '/api/info',
			function: async (req, res)=> {
				res.send(await manager.getStats());
			}
		},

		{
			protocol: "get",
			path: '/api/login',
			function: async (req, res) => {
				var code = req.query.code;

				try {
					var auth = await axios.post('https://discord.com/api/v6/oauth2/token',
						qs.stringify({
							code,
							client_id: process.env.CLIENT_ID,
							client_secret: process.env.CLIENT_SECRET,
							grant_type: 'authorization_code',
							redirect_uri: process.env.REDIRECT_URI,
							scope: 'identify guilds'
						}), {
							headers: {
								'Content-Type': 'application/x-www-form-urlencoded'
							}
						}
					)
				} catch(e) {
					console.log(e.response.data);
					return res.status(500).send(e.response.data);
				}

				var {user, guilds} = await userAuth(auth.data.access_token);
				var token = await manager.stores.tokens.get(user.id);
				if(!token) return res.status(401).send({error: 'Unauthorized - no API token exists for that user'});

				user.tokens = {token: token.token, discord_token: auth.data.access_token, refresh: auth.data.refresh_token};
				req.session.user = user;
				req.session.guilds = guilds;

				req.session.save();

				res.redirect('/dash');
			}
		},

		{
			protocol: "get",
			path: '/api/user',
			function: async (req, res) => {
				if(!req.session.user) return res.status(401).send();

				res.send({user: req.session.user, guilds: req.session.guilds});
			}
		},

		{
			protocol: 'put',
			path: '/api/color',
			function: async (req, res) => {
				if(!req.session.user) return res.status(401).send();
				var user = req.session.user;

				var data = req.body;
				if(!data.name || !data.color) return res.status(400).send('Bad request - missing information.');

				var existing = await manager.stores.colors.get(user.id, data.name.toLowerCase());
				if(existing) return res.status(400).send('Bad request - color already exists.');

				var color = await manager.stores.colors.create(user.id, data.name, {color: tc(data.color).toHex()});

				req.session.user.colors.push(color);
				req.session.user.colors = req.session.user.colors.sort((a, b) => {
					a.name.toLowerCase() > b.name.toLowerCase() ? 1
					: a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 0
				});

				req.session.save();

				res.status(200).json(color);
			}
		},

		{
			protocol: 'get',
			path: '/api/color/:color',
			function: async (req, res) => {
				if(!req.session.user) return res.status(401).send();
				var user = req.session.user;

				var color = await manager.stores.colors.get(user.id, req.params.color.toLowerCase());
				if(!color) return res.status(404).send();

				res.status(200).json(color);
			}
		},

		{
			protocol: 'patch',
			path: '/api/color/:color',
			function: async (req, res) => {
				if(!req.session.user) return res.status(401).send();
				var user = req.session.user;

				var data = req.body;
				data.color = tc(data.color).toHex();

				var color = await manager.stores.colors.get(user.id, req.params.color.toLowerCase());
				if(!color) return res.status(404).send();

				var exists = await manager.stores.colors.get(user.id, req.body.name.toLowerCase());
				if(exists && exists.id != color.id) return res.status(400).send('Bad request - color with that name already exists.');

				color = await manager.stores.colors.update(user.id, color.name.toLowerCase(), data);
				var index = req.session.user.colors.findIndex(c => {
					return c.id == color.id
				});
				req.session.user.colors[index] = color;
				req.session.user.colors = req.session.user.colors.sort((a, b) => {
					a.name.toLowerCase() > b.name.toLowerCase() ? 1
					: a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 0
				});

				req.session.save();

				res.status(200).json(color);
			}
		},

		{
			protocol: 'delete',
			path: '/api/color/:color',
			function: async (req, res) => {
				if(!req.session.user) return res.status(401).send();
				var user = req.session.user;

				var color = await manager.stores.colors.get(user.id, req.params.color.toLowerCase());
				if(!color) return res.status(404).send();

				await manager.stores.colors.delete(user.id, req.params.color.toLowerCase());
				req.session.user.colors.splice(req.session.user.colors.findIndex(c => c.id == color.id), 1);

				res.status(200).send();
			}
		},

		{
			protocol: 'get',
			path: '/api/guilds/:guildid',
			function: async (req, res) => {
				if(!req.session.user) return res.status(401).send();
				var user = req.session.user;

				try {
					var guild = await manager.getGuild(req.params.guildid, user.id);
				} catch(e) {
					return res.status(500).send(e.message);
				}

				if(!guild) return res.status(404).send();
				if(!guild.members.find(m => m.id == user.id))
					return res.status(401).send();

				return res.send(guild);
			}
		},

		{
			protocol: 'patch',
			path: '/api/role/:guildid/:roleid',
			function: async (req, res) => {
				if(!req.session.user) return res.status(401).send();
				var user = req.session.user;

				try {
					var role = await manager.editRole(user, req.params.guildid, req.params.roleid, req.body);
				} catch(e) {
					return res.status(500).send(e.message);
				}

				var guild = await manager.getGuild(req.params.guildid);
				guild.extras = {};
				var config = await manager.stores.configs.get(guild.id)
				if(config) {
					guild.extras.config = config;
				}

				var usages = await manager.stores.usages.get(guild.id)
				if(usages) guild.extras.usages = usages;

				var serverRoles = await manager.stores.serverRoles.getAllRaw(guild.id)
				if(serverRoles) guild.extras.serverRoles = serverRoles;

				var userRoles = await manager.stores.userRoles.getAllRaw(guild.id)
				if(userRoles) guild.extras.userRoles = userRoles;

				req.session.guilds[req.session.guilds.findIndex(g => g.id == guild.id)] = guild;

				return res.status(200).json(role);
			}
		},

		{
			protocol: 'delete',
			path: '/api/role/:guildid/:roleid',
			function: async (req, res) => {
				if(!req.session.user) return res.status(401).send();
				var user = req.session.user;

				try {
					await manager.deleteRole(user, req.params.guildid, req.params.roleid);
				} catch(e) {
					return res.status(500).send(e.message);
				}

				var guild = await manager.getGuild(req.params.guildid);
				
				req.session.guilds[req.session.guilds.findIndex(g => g.id == guild.id)] = guild;

				return res.status(200).send();
			}
		}
	];

	const userAuth = async (token) => {
		var user, guilds;
		try {
			var user = await axios('https://discord.com/api/v6/users/@me', {
				headers: {
					Authorization: 'Bearer '+token
				}
			});
			var guilds = await axios('https://discord.com/api/v6/users/@me/guilds', {
				headers: {
					Authorization: 'Bearer '+token
				}
			});
		} catch(e) {
			console.log(e.response ? e.response.data : e);
			return {user, guilds};
		}

		var cached = {
			users: await manager.getUsers(),
			guilds: await manager.getGuilds()
		}

		user = Object.assign(user.data, cached.users.find(u => u.id == user.data.id));
		guilds = cached.guilds.filter(g => guilds.data.find(x => x.id == g.id));

		return {
			user,
			guilds
		}
	}

	app.use(async (req, res, next) => {
		if(req.session?.user) return next();

		var token = await manager.stores.tokens.getByToken(req.headers['authorization']);
		if(!token) return next();

		var cached = {
			users: await manager.getUsers(),
			guilds: await manager.getGuilds()
		}

		var user = Object.assign({}, cached.users.find(u => u.id == token.user_id));
		var guilds = cached.guilds.filter(g => g.members.cache.find(m => m.userID == token.user_id));

		req.session.user = user;
		req.session.guilds = guilds;
		req.session.save();

		next();
	})

	for(var route of routes) {
		app[route.protocol](route.path, route.function);
	}

	app.use(express.static(path.join(__dirname, '..', 'frontend','build')));

	app.use(async (req, res)=> {
		var index = fs.readFileSync(path.join(__dirname, '..', 'frontend','build','index.html'),'utf8');
		index = index.replace('$TITLE','Sheep Docs')
					 .replace('$DESC','Documentation for a bot called Sheep')
					 .replace('$TWITDESC','Documentation for a bot called Sheep')
					 .replace('$TWITTITLE','Sheep Docs')
					 .replace('$OGTITLE','Sheep Docs')
					 .replace('$OGDESC','Documentation for a bot called Sheep')
					 .replace('$OEMBED','oembed.json');
		res.send(index);
	});

	return Promise.resolve(routes);
}