const { Models: { DataObject, DataStore }} = require('frame');

const KEYS = {
	id: { },
	server_id: { },
	role_mode: { patch: true },
	disabled: { patch: true },
	pingable: { patch: true },
	readable: { patch: true },
	hoist: { patch: true }
}

class Config extends DataObject {
	constructor(store, keys, data) {
		super(store, keys, data);
	}
}

class ConfigStore extends DataStore {
	constructor(bot, db) {
		super(bot, db);
	};

	async init() {
		await this.db.query(`
			CREATE TABLE IF NOT EXISTS configs (
				id 			SERIAL PRIMARY KEY,
				server_id 	TEXT,
				role_mode 	INTEGER,
				disabled 	TEXT[],
				pingable 	BOOLEAN,
				readable 	BOOLEAN,
				hoist 		TEXT
			);
		`)
	}

	async create(data = {}) {
		try {
			var c = await this.db.query(`INSERT INTO configs (
				server_id,
				role_mode,
				disabled,
				pingable,
				readable,
				hoist
			) VALUES ($1,$2,$3,$4,$5,$6)
			RETURNING id`,
			[
				data.server_id,
				data.role_mode || 0,
				data.disabled || [],
				data.pingable || false,
				data.readable || false,
				data.hoist
			]);
		} catch(e) {
			console.log(e);
	 		return Promise.reject(e.message);
		}

		return await this.getID(c.rows[0].id);
	}

	async index(data = {}) {
		try {
			await this.db.query(`INSERT INTO configs (
				server_id,
				role_mode,
				disabled,
				pingable,
				readable,
				hoist
			) VALUES ($1,$2,$3,$4,$5,$6)`,
			[data.server_id, data.role_mode || 0, data.disabled || [], data.pingable || false, data.readable || false, data.hoist]);
		} catch(e) {
			console.log(e);
	 		return Promise.reject(e.message);
		}
		
		return;
	}

	async get(server) {
		try {
				var data = await this.db.query(`SELECT * FROM configs WHERE server_id = $1`,[server]);
			} catch(e) {
				console.log(e);
				return Promise.reject(e.message);
			}
			
			if(data.rows && data.rows[0]) {
				return new Config(this, KEYS, data.rows[0]);
			} else return new Config(this, KEYS, { server_id: server });
	}

	async getID(id) {
		try {
				var data = await this.db.query(`SELECT * FROM configs WHERE id = $1`,[id]);
			} catch(e) {
				console.log(e);
				return Promise.reject(e.message);
			}
			
			if(data.rows && data.rows[0]) {
				return new Config(this, KEYS, data.rows[0]);
			} else return new Config(this, KEYS, { });
	}

	async update(id, data = {}) {
		try {
			await this.db.query(`UPDATE configs SET ${Object.keys(data).map((k, i) => k+"=$"+(i+2)).join(",")} WHERE id = $1`,[id, ...Object.values(data)]);
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message);
		}

		return await this.getID(id);
	}

	async delete(id) {
		try {
			await this.db.query(`DELETE FROM configs WHERE id = $1`, [id]);
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message);
		}

		return;
	}
}

module.exports = (bot, db) => new ConfigStore(bot, db);