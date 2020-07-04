const fs  	= require('fs');
const path 	= require('path');

var utils 	= {};

module.exports = (app, ipc) => {
	files = fs.readdirSync(__dirname + "/../utils");
	files.forEach(f => Object.assign(utils, require("../utils/"+f)));
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
		}
	];

	routes.forEach(route => {
		app[route.protocol](route.path, route.function);
	})

	return routes;
}