const { Models: { DataObject, DataStore }} = require('frame');

const KEYS = {
	id: { },
	user_id: { },
	name: { patch: true },
	color: { patch: true }
}

class Color extends DataObject {
	constructor(store, keys, data) {
		super(store, keys, data);
	}
}

class ColorStore extends DataStore {
	constructor(bot, db) {
		super(bot, db);
	};

	async init() {
		await this.db.query(`
			CREATE TABLE IF NOT EXISTS colors (
				id 			SERIAL PRIMARY KEY,
				user_id 	TEXT,
				name 		TEXT,
				color 		TEXT
			);
		`)
	}

	async create(data = {}) {
		try {
			var c = await this.db.query(`INSERT INTO colors (
				user_id,
				name,
				color
			) VALUES ($1,$2,$3)
			RETURNING id`,
			[data.user_id, data.name, data.color])
		} catch(e) {
			console.log(e);
	 		return Promise.reject(e.message);
		}
		
		return await this.getID(c.rows[0].id);
	}

	async index(user, name, data = {}) {
		try {
			await this.db.query(`INSERT INTO colors (
				user_id,
				name,
				color
			) VALUES ($1,$2,$3)`,
			[user, name, data.color])
		} catch(e) {
			console.log(e);
	 		return Promise.reject(e.message);
		}
		
		return;
	}

	async getID(id) {
		try {
			var data = await this.db.query(`SELECT * FROM colors WHERE id = $1`, [id]);
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message);
		}
		
		if(data.rows && data.rows[0]) {
			return new Color(this, KEYS, data.rows[0]);
		} else return new Color(this, KEYS, { });
	}

	async get(user, name) {
		try {
			var data = await this.db.query(`SELECT * FROM colors WHERE user_id = $1 AND LOWER(name) = $2`,[user, name]);
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message);
		}
		
		if(data.rows && data.rows[0]) {
			return new Color(this, KEYS, data.rows[0]);
		} else return new Color(this, KEYS, { user_id: user, name });
	}

	async getAll(user) {
		try {
			var data = await this.db.query(`SELECT * FROM colors WHERE user_id = $1`,[user]);
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message);
		}
		
		if(data.rows && data.rows[0]) {
			return data.rows.map(x => new Color(this, KEYS, x));
		} else return [];
	}

	async update(id, data = {}) {
		try {
			await this.db.query(`UPDATE colors SET ${Object.keys(data).map((k, i) => k+"=$"+(i+2)).join(",")} WHERE id = $1`,[id, ...Object.values(data)]);
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message);
		}

		return await this.getID(id);
	}

	async delete(id) {
		try {
			await this.db.query(`DELETE FROM colors WHERE id = $1`, [id]);
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message);
		}
		
		return;
	}

	async deleteAll(user) {
		try {
			await this.db.query(`DELETE FROM colors WHERE user_id = $1`, [user]);
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message);
		}
		
		return;
	}

	async export(user, color) {
		try {
			var colors = await this.getAll(user);
		} catch(e) {
			return Promise.reject(e);
		}
		if(!colors) return Promise.reject("No colors saved");
		if(color) colors = colors.filter(x => x.name == color);
		if(!colors || !colors[0]) return Promise.reject("Color not found");

		return colors.map(c => { return {name: c.name, color: c.color} }); 
	}

	async import(user, data = []) {
		try {
			var colors = await this.getAll(user);
			var updated = 0, created = 0;
			for(var color of data) {
				//gotta normalize all incoming color names to lowercase
				//in case of tampering

				var c = colors?.find(x => x.name.toLowerCase() == color.name.toLowerCase());
				if(c) {
					c.name = color.name;
					c.color = color.color;
					await c.save();
					updated++;
				} else {
					await this.create({
						user_id: user,
						name: color.name, 
						color: color.color
					});
					created++;
				}
			}
		} catch(e) {
			return Promise.reject(e);
		}

		return {updated, created, colors: await this.getAll(user)};
	}
}

module.exports = (bot, db) => new ColorStore(bot, db);