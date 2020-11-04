const {Collection} = require("discord.js");

class UserConfigStore extends Collection {
	constructor(bot, db) {
		super();

		this.db = db;
		this.bot = bot;
	};

	async create(user, data = {}) {
		return new Promise(async (res, rej) => {
			try {
				await this.db.query(`INSERT INTO user_configs (
					user_id,
					auto_rename
				) VALUES ($1,$2)`,
				[user, data.auto_rename || false]);
			} catch(e) {
				console.log(e);
		 		return rej(e.message);
			}
			
			res(await this.get(user));
		})
	}

	async index(user, data = {}) {
		return new Promise(async (res, rej) => {
			try {
				await this.db.query(`INSERT INTO user_configs (
					user_id,
					auto_rename
				) VALUES ($1,$2)`,
				[user, data.auto_rename || false]);
			} catch(e) {
				console.log(e);
		 		return rej(e.message);
			}
			
			res();
		})
	}

	async get(user, forceUpdate = false) {
		return new Promise(async (res, rej) => {
			if(!forceUpdate) {
				var config = super.get(user);
				if(config) return res(config);
			}
			
			try {
				var data = await this.db.query(`SELECT * FROM user_configs WHERE user_id = $1`,[user]);
			} catch(e) {
				console.log(e);
				return rej(e.message);
			}
			
			if(data.rows && data.rows[0]) {
				this.set(user, data.rows[0])
				res(data.rows[0])
			} else res(undefined);
		})
	}

	async update(user, data = {}) {
		return new Promise(async (res, rej) => {
			try {
				await this.db.query(`UPDATE user_configs SET ${Object.keys(data).map((k, i) => k+"=$"+(i+2)).join(",")} WHERE user_id = $1`,[user, ...Object.values(data)]);
			} catch(e) {
				console.log(e);
				return rej(e.message);
			}

			res(await this.get(user, true));
		})
	}

	async delete(user) {
		return new Promise(async (res, rej) => {
			try {
				await this.db.query(`DELETE FROM user_configs WHERE user_id = $1`, [user]);
			} catch(e) {
				console.log(e);
				return rej(e.message);
			}
			
			super.delete(user);
			res();
		})
	}
}

module.exports = (bot, db) => new UserConfigStore(bot, db);