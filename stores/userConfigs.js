const { Models: { DataObject, DataStore }} = require('frame');

const KEYS = {
	id: { },
	user_id: { },
	auto_rename: { patch: true },
	a11y: { patch: true }
}

class UserConfig extends DataObject {
	constructor(store, keys, data) {
		super(store, keys, data);
	}
}

class UserConfigStore extends DataStore {
	constructor(bot, db) {
		super(bot, db);
	};

	async init() {
		await this.db.query(`
			CREATE TABLE IF NOT EXISTS user_configs (
				id			SERIAL PRIMARY KEY,
				user_id		TEXT,
				auto_rename BOOLEAN,
				a11y 		BOOLEAN
			);
		`)
	}

	async create(data = {}) {
		try {
			var c = await this.db.query(`INSERT INTO user_configs (
				user_id,
				auto_rename,
				a11y
			) VALUES ($1,$2,$3)
			RETURNING id`,
			[
				data.user_id,
				data.auto_rename,
				data.a11y
			]);
		} catch(e) {
			console.log(e);
	 		return Promise.reject(e.message);
		}
		
		await this.getID(c.rows[0].id);
	}

	async index(data = {}) {
		try {
			await this.db.query(`INSERT INTO user_configs (
				user_id,
				auto_rename,
				a11y
			) VALUES ($1,$2,$3)
			RETURNING id`,
			[
				data.user_id,
				data.auto_rename,
				data.a11y
			]);
		} catch(e) {
			console.log(e);
	 		return Promise.reject(e.message);
		}
		
		return;
	}

	async get(user) {
		try {
				var data = await this.db.query(`SELECT * FROM user_configs WHERE user_id = $1`,[user]);
			} catch(e) {
				console.log(e);
				return Promise.reject(e.message);
			}
			
			if(data.rows && data.rows[0]) {
				return new UserConfig(this, KEYS, data.rows[0]);
			} else return new UserConfig(this, KEYS, { user_id: user });
	}

	async getID(id) {
		try {
				var data = await this.db.query(`SELECT * FROM user_configs WHERE id = $1`,[id]);
			} catch(e) {
				console.log(e);
				return Promise.reject(e.message);
			}
			
			if(data.rows && data.rows[0]) {
				return new UserConfig(this, KEYS, data.rows[0]);
			} else return new UserConfig(this, KEYS, { });
	}

	async update(id, data = {}) {
		try {
			await this.db.query(`UPDATE user_configs SET ${Object.keys(data).map((k, i) => k+"=$"+(i+2)).join(",")} WHERE id = $1`,[id, ...Object.values(data)]);
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message);
		}

		return await this.getID(id);
	}

	async delete(id) {
		try {
			await this.db.query(`DELETE FROM user_configs WHERE id = $1`, [id]);
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message);
		}

		return;
	}
}

module.exports = (bot, db) => new UserConfigStore(bot, db);