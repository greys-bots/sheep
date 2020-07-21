const {Collection} = require("discord.js");

class TokenStore extends Collection {
	constructor(bot, db) {
		super();

		this.db = db;
		this.bot = bot;
	};

	async create(user, token, data = {}) {
		return new Promise(async (res, rej) => {
			try {
				await this.db.query(`INSERT INTO user_tokens (
					user_id,
					token
				) VALUES ($1,$2)`,
				[user, token]);
			} catch(e) {
				console.log(e);
		 		return rej(e.message);
			}
			
			res(await this.get(user));
		})
	}

	async index(user, token, data = {}) {
		return new Promise(async (res, rej) => {
			try {
				await this.db.query(`INSERT INTO user_tokens (
					user_id,
					token
				) VALUES ($1,$2)`,
				[user, token]);
			} catch(e) {
				console.log(e);
		 		return rej(e.message);
			}
			
			res();
		})
	}

	async get(user, forceUpdate = false) {
		console.log("user", user);
		return new Promise(async (res, rej) => {
			if(!forceUpdate) {
				var token = super.get(user);
				if(token) return res(token);
			}
			
			try {
				var data = await this.db.query(`SELECT * FROM user_tokens WHERE user_id = $1`,[user]);
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

	async getByToken(token, forceUpdate = false) {
		return new Promise(async (res, rej) => {
			try {
				var data = await this.db.query(`SELECT * FROM user_tokens WHERE token = $1`,[token]);
			} catch(e) {
				console.log(e);
				return rej(e.message);
			}
			
			if(data.rows && data.rows[0]) {
				res(data.rows[0])
			} else res(undefined);
		})
	}

	async validate(user, token, forceUpdate = false) {
		return new Promise(async (res, rej) => {
			try {
				var data = await this.db.query(`SELECT * FROM user_tokens WHERE user_id = $1 AND token = $2`,[user, token]);
			} catch(e) {
				console.log(e);
				return rej(e.message);
			}
			
			if(data.rows && data.rows[0]) {
				res(data.rows[0])
			} else res(undefined);
		})
	}

	async update(user, data = {}) {
		return new Promise(async (res, rej) => {
			try {
				await this.db.query(`UPDATE user_tokens SET ${Object.keys(data).map((k, i) => k+"=$"+(i+2)).join(",")} WHERE user_id = $1`,[user, ...Object.values(data)]);
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
				await this.db.query(`DELETE FROM user_tokens WHERE user_id = $1`, [user]);
			} catch(e) {
				console.log(e);
				return rej(e.message);
			}
			
			super.delete(user);
			res();
		})
	}
}

module.exports = (bot, db) => new TokenStore(bot, db);