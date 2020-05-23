const fs  	= require('fs');

var utils 	= {};

module.exports = (app, ipc) => {
	files = fs.readdirSync("./utils");
	files.forEach(f => Object.assign(utils, require("../utils/"+f)));
	console.log("utils loaded");

	var routes = [
		{
			protocol: "get",
			path: "/color/:col",
			function: async (req, res)=> {
				console.log(req.query);
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
				console.log(req.query);
				var img = await utils.createSheepImage(req.params.col, req.query);
				res.type('png');
				res.write(img);
				res.end();
			}
		},

		{
			protocol: "get",
			path: '/api/command/:cmd',
			function: async (req, res)=> {
				res.send(ipc.data.commands[req.params.cmd]);
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