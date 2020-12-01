const express 	= require('express');
const path 		= require('path');
const fs  		= require('fs');
const session 	= require('express-session');

require('dotenv').config();

const app 		= express();

app.use(require('cookie-parser')());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
	cookie: {maxAge: 60 * 60 * 1000},
	secret: process.env.CLIENT_SECRET, //easiest?
	resave: true,
	saveUninitialized: false
}));

(async () => {
	var manager = await require(__dirname + '/modules/manager')();
	var routes = await require(__dirname + '/modules/routes')(app, manager);

	manager.on('message', (shard, msg) => {
	    if(msg == "READY" && shard.id == manager.totalShards - 1) {
	        console.log("sheep site ready");
			module.exports = app;
			app.listen(process.env.PORT || 8080);
	    }
	})
})();