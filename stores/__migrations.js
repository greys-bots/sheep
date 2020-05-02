require('dotenv').config();

var dblite 	= require('dblite');
var fs 		= require('fs');
var Eris 	= require("eris-additions")(require("eris"));
var bot 	= new Eris(process.env.TOKEN, {restmode: true});

const old_db = dblite('tmp.sqlite', '-header');

async function migrate() {
	const db = await require(__dirname+'/__db')(bot);

	old_db.query(`SELECT * FROM configs`, {
		id: Number,
		server_id: String,
		role_mode: Number,
		disabled: val => val ? JSON.parse(val) : null,
		pingable: Boolean
	}, async (err, rows) => {
		if(err) {
			console.log(err);
			return;
		} else {
			for(var config of rows) await bot.stores.configs.index(config.server_id, config);
		}
	})

	old_db.query(`SELECT * FROM colors`, async (err, rows) => {
		if(err) {
			console.log(err);
			return;
		} else {
			for(var color of rows) await bot.stores.colors.index(color.user_id, color.name, color);
		}
	})

	old_db.query(`SELECT * FROM roles`, async (err, rows) => {
		if(err) {
			console.log(err);
			return;
		} else {
			for(var role of rows) {
				console.log(role);
				if(role.type == 0) await bot.stores.userRoles.index(role.server_id, role.user_id, role.role_id);
				else await bot.stores.serverRoles.index(role.server_id, role.role_id);
			}
		}
	})
}

migrate();