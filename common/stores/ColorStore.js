const {Collection} = require("discord.js");
const tc 		   = require('tinycolor2');

class ColorStore extends Collection {
	constructor(bot, db) {
		super();

		this.db = db;
		this.bot = bot;
	};

	async create(user, name, data = {}) {
		return new Promise(async (res, rej) => {
			try {
				await this.db.query(`INSERT INTO colors (
					user_id,
					name,
					color
				) VALUES ($1,$2,$3)`,
				[user, name, data.color])
			} catch(e) {
				console.log(e);
		 		return rej(e.message);
			}
			
			res(await this.get(user, name));
		})
	}

	async index(user, name, data = {}) {
		return new Promise(async (res, rej) => {
			try {
				await this.db.query(`INSERT INTO colors (
					user_id,
					name,
					color
				) VALUES ($1,$2,$3)`,
				[user, name, data.color])
			} catch(e) {
				console.log(e);
		 		return rej(e.message);
			}
			
			res();
		})
	}

	async get(user, name, forceUpdate = false) {
		return new Promise(async (res, rej) => {
			if(!forceUpdate) {
				var color = super.get(`${user}-${name}`);
				if(color) return res(color);
			}
			
			try {
				var data = await this.db.query(`SELECT * FROM colors WHERE user_id = $1 AND LOWER(name) = $2`,[user, name]);
			} catch(e) {
				console.log(e);
				return rej(e.message);
			}
			
			if(data.rows && data.rows[0]) {
				this.set(`${user}-${name}`, data.rows[0])
				res(data.rows[0])
			} else res(undefined);
		})
	}

	async getAll(user) {
		return new Promise(async (res, rej) => {
			try {
				var data = await this.db.query(`SELECT * FROM colors WHERE user_id = $1`,[user]);
			} catch(e) {
				console.log(e);
				return rej(e.message);
			}
			
			if(data.rows && data.rows[0]) {
				res(data.rows)
			} else res(undefined);
		})
	}

	async update(user, name, data = {}) {
		return new Promise(async (res, rej) => {
			try {
				await this.db.query(`UPDATE colors SET ${Object.keys(data).map((k, i) => k+"=$"+(i+3)).join(",")} WHERE user_id = $1 AND LOWER(name) = $2`,[user, name, ...Object.values(data)]);
			} catch(e) {
				console.log(e);
				return rej(e.message);
			}

			res(await this.get(user, data.name?.toLowerCase() || name, true));
		})
	}

	async delete(user, name) {
		return new Promise(async (res, rej) => {
			try {
				await this.db.query(`DELETE FROM colors WHERE user_id = $1 AND name = $2`, [user, name]);
			} catch(e) {
				console.log(e);
				return rej(e.message);
			}
			
			super.delete(`${user}-${name}`);
			res();
		})
	}

	async deleteAll(user) {
		return new Promise(async (res, rej) => {
			var colors = await this.getAll(user);
			try {
				await this.db.query(`DELETE FROM colors WHERE user_id = $1`, [user]);
			} catch(e) {
				console.log(e);
				return rej(e.message);
			}
			
			for(var color of colors) super.delete(`${user}-${color.name}`);
			res();
		})
	}

	async export(user, color) {
		return new Promise(async (res, rej) => {
			try {
				var colors = await this.getAll(user);
			} catch(e) {
				return rej(e);
			}
			if(!colors) return rej("No colors saved");
			if(color) colors = colors.filter(x => x.name == color);
			if(!colors || !colors[0]) return rej("Color not found");

			res(colors.map(c => { return {name: c.name, color: c.color} })); 
		})
	}

	async import(user, data = []) {
		return new Promise(async (res, rej) => {
			try {
				var colors = await this.getAll(user);
				var updated = 0, created = 0;
				for(var color of data) {
					if(colors && colors.find(c => c.name.toLowerCase() == color.name.toLowerCase())) {
						await this.update(user, color.name, {color: tc(color.color).toHex()});
						updated++;
					} else {
						await this.create(user, color.name, {color: tc(color.color).toHex()});
						created++;
					}
				}
			} catch(e) {
				return rej(e);
			}

			return res({updated, created, colors: await this.getAll(user)});
		})
	}

	//normalize colors in the database
	//to all be hex strings
	async normalize() {
		return new Promise(async (res, rej) => {
			try {
				var data = await this.db.query(`SELECT * FROM colors`);
			} catch(e) {
				return rej(e.message);
			}

			if(!data?.rows) return res();

			for(var color of data.rows) {
				await this.update(color.user_id, color.name.toLowerCase(), {color: tc(color.color).toHex()});
			}

			res();
		})
	}
}

module.exports = (bot, db) => new ColorStore(bot, db);