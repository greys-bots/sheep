const { Models: { DataObject, DataStore }} = require('frame');

const KEYS = {
	id: { },
	server_id: { },
	role_id: { }
}

class ServerRole extends DataObject {
	constructor(store, keys, data) {
		super(store, keys, data);
	}
}

class ServerRoleStore extends DataStore {
	constructor(bot, db) {
		super(bot, db);
	};

	async init() {
		await this.db.query(`
			CREATE TABLE IF NOT EXISTS server_roles (
				id 			SERIAL PRIMARY KEY,
				server_id 	TEXT,
				role_id 	TEXT
			);
		`)
	}

	async create(data) {
		try {
			var c = await this.db.query(`INSERT INTO server_roles (
				server_id,
				role_id
			) VALUES ($1,$2)
			RETURNING id`,
			[data.server_id, data.role_id])
		} catch(e) {
			console.log(e);
	 		return Promise.reject(e.message);
		}
		
		return await this.getID(c.rows[0].id);
	}

	async index(data) {
		try {
			await this.db.query(`INSERT INTO server_roles (
				server_id,
				role_id
			) VALUES ($1,$2)`,
			[data.server_id, data.role_id])
		} catch(e) {
			console.log(e);
	 		return Promise.reject(e.message);
		}
		
		return;
	}

	async getID(id) {
		try {
				var data = await this.db.query(`SELECT * FROM server_roles WHERE id = $1`,[id]);
			} catch(e) {
				console.log(e);
				return Promise.reject(e.message);
			}
			
			if(data.rows && data.rows[0]) {
				return new ServerRole(this, KEYS, data.rows[0]);
			} else return undefined;
	}

	async get(server, role) {
		try {
			var data = await this.db.query(`SELECT * FROM server_roles WHERE server_id = $1 AND role_id = $2`, [server, role]);
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message);
		}

		var guild = this.bot.guilds.resolve(server);
		if(!guild) return Promise.reject("Couldn't get guild");
		
		if(data.rows && data.rows[0]) {
			var rl;
			for(var i = 0; i < data.rows.length; i++) {
				rl = guild.roles.cache.find(r => r.id == data.rows[i].role_id);
				if(!rl || rl.deleted) {
					data.rows[i] = "deleted";
				} else data.rows[i].raw = rl;
			}
			data.rows = data.rows.filter(x => x != "deleted");
			if(!data.rows || !data.rows[0]) return undefined;
			return new ServerRole(this, KEYS, data.rows[0]);
		} else return undefined;
	}

	async getRaw(server, role) {
		try {
			var data = await this.db.query(`SELECT * FROM server_roles WHERE server_id = $1 AND role_id = $2`, [server, role]);
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message);
		}

		if(data.rows && data.rows[0]) {
			return new ServerRole(this, KEYS, data.rows[0]);
		} else return undefined;
	}

	async getAll(server) {
		try {
			var data = await this.db.query(`SELECT * FROM server_roles WHERE server_id = $1`,[server]);
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message);
		}

		var guild = this.bot.guilds.resolve(server);
		if(!guild) return Promise.reject("Couldn't get guild");
		
		if(data.rows && data.rows[0]) {
			var rl;
			for(var i = 0; i < data.rows.length; i++) {
				rl = guild.roles.cache.find(r => r.id == data.rows[i].role_id);
				if(!rl || rl.deleted) {
					data.rows[i] = "deleted";
				} else data.rows[i].raw = rl;
			}
			data.rows = data.rows.filter(x => x != "deleted");
			if(!data.rows || !data.rows[0]) return undefined;
			return data.rows.map(x => new ServerRole(this, KEYS, x))
		} else return undefined;
	}

	async update(id, data = {}) {
		try {
			await this.db.query(`UPDATE server_roles SET ${Object.keys(data).map((k, i) => k+"=$"+(i+2)).join(",")} WHERE id = $1`,[id, ...Object.values(data)]);
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message);
		}

		return await this.getID(id);
	}

	async delete(id) {
		try {
			await this.db.query(`DELETE FROM server_roles WHERE id = $1`, [id]);
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message);
		}
		
		return;
	}

	async deleteAll(server) {
		try {
			await this.db.query(`DELETE FROM server_roles WHERE server_id = $1`, [server]);
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message);
		}
		
		return;
	}
}

module.exports = (bot, db) => new ServerRoleStore(bot, db);