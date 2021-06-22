var fs = require('fs');
var {Pool} = require('pg');

module.exports = (bot) => {
	const db = new Pool();

	db.query(`
		CREATE TABLE IF NOT EXISTS colors (
			id 			SERIAL PRIMARY KEY,
			user_id 	TEXT,
			name 		TEXT,
			color 		TEXT
		);

		CREATE TABLE IF NOT EXISTS configs (
			id 			SERIAL PRIMARY KEY,
			server_id 	TEXT,
			role_mode 	INTEGER,
			disabled 	TEXT[],
			pingable 	BOOLEAN,
			readable 	BOOLEAN
		);

		CREATE TABLE IF NOT EXISTS server_roles (
			id 			SERIAL PRIMARY KEY,
			server_id 	TEXT,
			role_id 	TEXT
		);

		CREATE TABLE IF NOT EXISTS usages (
			id 			SERIAL PRIMARY KEY,
			server_id 	TEXT,
			whitelist 	TEXT[],
			blacklist 	TEXT[],
			type 		INTEGER
		);

		CREATE TABLE IF NOT EXISTS user_configs (
			id			SERIAL PRIMARY KEY,
			user_id		TEXT,
			auto_rename BOOLEAN,
			a11y 		BOOLEAN
		);

		CREATE TABLE IF NOT EXISTS user_roles (
			id 			SERIAL PRIMARY KEY,
			server_id 	TEXT,
			user_id 	TEXT,
			role_id 	TEXT
		);
	`);

	bot.stores = {};
	var files = fs.readdirSync(__dirname);
	for(var file of files) {
		if(["__db.js", "__migrations.js"].includes(file)) continue;
		var tmpname = file.replace(/store\.js/i, "");
		var name =  tmpname[0].toLowerCase() + 
				   (tmpname.endsWith("y") ?
				   	tmpname.slice(1, tmpname.length-1) + "ies" : //CategoryStore.js becomes categories
				    tmpname.slice(1) + "s"); //ProfileStore.js becomes profiles

		bot.stores[name] = require(__dirname+'/'+file)(bot, db);
		if(bot.stores[name].init) bot.stores[name].init();
	}

	return db;
}