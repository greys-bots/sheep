const { Models: { DataObject, DataStore }} = require('frame');

const KEYS = {
	id: { },
	server_id: { },
	user_id: { },
	role_id: { }
}

class UserRole extends DataObject {
	constructor(store, keys, data) {
		super(store, keys, data);
		if(data.raw) this.raw = data.raw;
	}
}

class UserRoleStore extends DataStore {
	constructor(bot, db) {
		super(bot, db);
	};

	async init() {
		await this.db.query(`
			CREATE TABLE IF NOT EXISTS user_roles (
				id 			SERIAL PRIMARY KEY,
				server_id 	TEXT,
				user_id 	TEXT,
				role_id 	TEXT
			);
		`)
	}

	async create(data) {
		try {
			var c = await this.db.query(`INSERT INTO user_roles (
				server_id,
				user_id,
				role_id
			) VALUES ($1,$2,$3)
			RETURNING id`,
			[data.server_id, data.user_id, data.role_id])
		} catch(e) {
			console.log(e);
	 		return Promise.reject(e.message);
		}
		
		return await this.getID(c.rows[0].id);
	}

	async index(data) {
		try {
			var c = await this.db.query(`INSERT INTO user_roles (
				server_id,
				user_id,
				role_id
			) VALUES ($1,$2,$3)
			RETURNING id`,
			[data.server_id, data.user_id, data.role_id])
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
				return new UserRole(this, KEYS, data.rows[0]);
			} else return new UserRole(this, KEYS, { });
	}

	async get(server, user) {
		try {
			var data = await this.db.query(`SELECT * FROM user_roles WHERE server_id = $1 AND user_id = $2`, [server, user]);
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
			return new UserRole(this, KEYS, data.rows[0]);
		} else return undefined;
	}

	async getRaw(server, user) {
		try {
			var data = await this.db.query(`SELECT * FROM user_roles WHERE server_id = $1 AND user_id = $2`, [server, user]);
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message);
		}

		if(data.rows && data.rows[0]) {
			return new UserRole(this, KEYS, data.rows[0]);
		} else return undefined;
	}

	async getByRoleRaw(server, role) {
		try {
			var data = await this.db.query(`SELECT * FROM user_roles WHERE server_id = $1 AND role_id = $2`, [server, role]);
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message);
		}

		if(data.rows && data.rows[0]) {
			return new UserRole(this, KEYS, data.rows[0]);
		} else return undefined;
	}

	async getAll(server) {
		try {
			var data = await this.db.query(`SELECT * FROM user_roles WHERE server_id = $1`,[server]);
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
			return data.rows.map(x => new UserRole(this, KEYS, x))
		} else return undefined;
	}

	async getAllRaw(server) {
		try {
			var data = await this.db.query(`SELECT * FROM user_roles WHERE server_id = $1`, [server]);
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message);
		}

		if(data.rows && data.rows[0]) {
			return data.rows.map(x => new UserRole(this, KEYS, x));
		} else return undefined;
	}

	async getAllByUserRaw(user) {
		try {
			var data = await this.db.query(`SELECT * FROM user_roles WHERE user_id = $1`, [user]);
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message);
		}

		if(data.rows && data.rows[0]) {
			return data.rows.map(x => new UserRole(this, KEYS, x));
		} else return undefined;
	}

	async getLinked(server, role) {
		try {
			var data = await this.db.query(`SELECT * FROM user_roles WHERE server_id = $1 AND role_id = $2`, [server, role]);
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message);
		}

		if(data.rows && data.rows[0]) {
			return data.rows.map(x => new UserRole(this, KEYS, x));
		} else return undefined;
	}

	async update(id, data = {}) {
		try {
			await this.db.query(`UPDATE user_roles SET ${Object.keys(data).map((k, i) => k+"=$"+(i+2)).join(",")} WHERE id = $1`,[id, ...Object.values(data)]);
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message);
		}

		return await this.getID(id);
	}

	async delete(id) {
		try {
			await this.db.query(`DELETE FROM user_roles WHERE id = $1`, [id]);
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message);
		}
		
		return;
	}

	async deleteByRoleID(server, role) {
		try {
			await this.db.query(`DELETE FROM user_roles WHERE server_id = $1 AND role_id = $2`, [server, role]);
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message);
		}
		
		return;
	}

	async deleteAll(server) {
		try {
			await this.db.query(`DELETE FROM user_roles WHERE server_id = $1`, [server]);
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message);
		}
		
		return;
	}

	async unlink(guild, role, user) {
		try {
			this.db.query(`DELETE FROM user_roles WHERE server_id = $1 AND role_id = $2 AND user_id = $3`, [guild, role, user]);
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message);
		}

		return;
	}
}

module.exports = (bot, db) => new UserRoleStore(bot, db);