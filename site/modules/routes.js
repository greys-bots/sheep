const fs  	= require('fs');
const path 	= require('path');
const axios = require('axios');
const qs = require('qs');

var utils 	= {};

module.exports = async (app, ipc) => {
	files = fs.readdirSync(__dirname + "/../utils");
	files.forEach(f => Object.assign(utils, require(__dirname + "/../utils/"+f)));
	console.log("utils loaded");

	var routes = [
		{
			protocol: "get",
			path: "/",
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
				res.send({modules: ipc.data.modules});
			}
		},

		{
			protocol: "get",
			path: '/api/module/:module',
			function: async (req, res)=> {
				var mod = ipc.data.modules.find(m => m.name.toLowerCase() == req.params.module.replace("-", " ").toLowerCase());
				if(!mod) return res.send(undefined);
				res.send(mod);
			}
		},

		{
			protocol: "get",
			path: '/api/commands',
			function: async (req, res)=> {
				res.send({commands: ipc.data.commands, modules: ipc.data.modules});
			}
		},

		{
			protocol: "get",
			path: '/api/command/:cmd',
			function: async (req, res)=> {
				var cmd;
				if(req.params.cmd.includes("-")) {
					var split = req.params.cmd.split("-");
					cmd = ipc.data.commands.find(c => c.name == split[0].toLowerCase());
				} else res.send(ipc.data.commands.find(c => c.name == req.params.cmd.toLowerCase()));
			}
		},

		{
			protocol: "get",
			path: '/api/info',
			function: async (req, res)=> {
				res.send(ipc.data.stats);
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
				var token = await app.stores.tokens.get(user.id);
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
			protocol: 'patch',
			path: '/api/color/:color',
			function: async (req, res) => {
				if(!req.session.user) return res.status(401).send();
				var user = req.session.user;

				var data = req.body;

				var color = await app.stores.colors.get(user.id, req.params.color.toLowerCase());
				if(!color) return res.status(404).send();

				color = await app.stores.colors.update(user.id, req.params.color.toLowerCase(), req.body);

				res.status(200).send(color);
			}
		},

		{
			protocol: 'patch',
			path: '/api/role/:guildid/:roleid',
			function: async (req, res) => {
				if(!req.session.user) return res.status(401).send();
				var user = req.session.user;
				console.log(req.body);

				ipc.of['sheep-bot'].emit('ROLE', {
					type: 'update',
					guild: req.params.guildid,
					role: req.params.roleid,
					user: req.session.user.id,
					data: req.body
				})

				//in case we don't get a response
				var timeout = setTimeout(()=> res.status(500).send('Timed out.'), 5000);

				ipc.of['sheep-bot'].once('ROLE', (msg) => {
					clearTimeout(timeout);
					if(msg.success) res.status(200).send(msg.role);
					else res.status(500).send(msg.err || 'ERR');
				})
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

		return {
			user: Object.assign(user.data, ipc.data.users.find(u => u.id == user.data.id)),
			guilds: ipc.data.guilds.filter(g => guilds.data.find(x => x.id == g.id))
		}
	}

	routes.forEach(route => {
		app[route.protocol](route.path, route.function);
	})

	return routes;
}