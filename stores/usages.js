const { Models: { DataObject, DataStore }} = require('frame');

const KEYS = {
	id: { },
	server_id: { },
	whitelist: { patch: true },
	blacklist: { patch: true },
	type: { patch: true }
}

class Usage extends DataObject {
	constructor(store, keys, data) {
		super(store, keys, data);
	}
}

class UsageStore extends DataStore {
	constructor(bot, db) {
		super(bot, db);
	};

	async init() {
		await this.db.query(`
			CREATE TABLE IF NOT EXISTS usages (
				id 			SERIAL PRIMARY KEY,
				server_id 	TEXT,
				whitelist 	TEXT[],
				blacklist 	TEXT[],
				type 		INTEGER
			);
		`)
	}

	async create(data = {}) {
		try {
			var c = await this.db.query(`INSERT INTO usages (
				server_id,
				whitelist,
				blacklist,
				type
			) VALUES ($1,$2,$3,$4)
			RETURNING id`,
			[data.server_id, data.whitelist || [], data.blacklist || [], data.type || 0]);
		} catch(e) {
			console.log(e);
	 		return Promise.reject(e.message);
		}
		
		return await this.getID(c.rows[0].id);
	}

	async index(data = {}) {
		try {
			await this.db.query(`INSERT INTO usages (
				server_id,
				whitelist,
				blacklist,
				type
			) VALUES ($1,$2,$3,$4)`,
			[data.server_id, data.whitelist || [], data.blacklist || [], data.type || 0]);
		} catch(e) {
			console.log(e);
	 		return Promise.reject(e.message);
		}
		
		return;
	}

	async get(server) {
		try {
			var data = await this.db.query(`SELECT * FROM usages WHERE server_id = $1`,[server]);
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message);
		}
		
		if(data.rows && data.rows[0]) {
			return new Usage(this, KEYS, data.rows[0])
		} else return undefined;
	}

	async getID(id) {
		try {
			var data = await this.db.query(`SELECT * FROM usages WHERE id = $1`,[id]);
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message);
		}
		
		if(data.rows && data.rows[0]) {
			return new Usage(this, KEYS, data.rows[0])
		} else return undefined;
	}

	async getByWhitelisted(server, id) {
		try {
			var data = await this.db.query(`SELECT * FROM usages WHERE server_id = $1 AND $2 = ANY(whitelist)`,[server, id]);
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message);
		}
		
		if(data.rows && data.rows[0]) {
			return new Usage(this, KEYS, data.rows[0]);
		} else return undefined;
	}

	async getByBlacklisted(server, id) {
		try {
			var data = await this.db.query(`SELECT * FROM usages WHERE server_id = $1 AND $2 = ANY(blacklist)`,[server, id]);
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message);
		}
		
		if(data.rows && data.rows[0]) {
			return new Usage(this, KEYS, data.rows[0])
		} else return undefined;
	}

	async update(id, data = {}) {
		try {
			await this.db.query(`UPDATE usages SET ${Object.keys(data).map((k, i) => k+"=$"+(i+2)).join(",")} WHERE id = $1`,[id, ...Object.values(data)]);
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message);
		}

		return await this.getID(id);
	}

	async delete(id) {
		try {
			await this.db.query(`DELETE FROM usages WHERE id = $1`, [id]);
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message);
		}
		
		return;
	}
}

module.exports = (bot, db) => new UsageStore(bot, db);