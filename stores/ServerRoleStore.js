const {Collection} = require("discord.js");

class ServerRoleStore extends Collection {
	constructor(bot, db) {
		super();

		this.db = db;
		this.bot = bot;
	};

	async create(server, role) {
		return new Promise(async (res, rej) => {
			try {
				await this.db.query(`INSERT INTO server_roles (
					server_id,
					role_id
				) VALUES ($1,$2)`,
				[server, role])
			} catch(e) {
				console.log(e);
		 		return rej(e.message);
			}
			
			res(await this.get(server, role));
		})
	}

	async get(server, role) {
		return new Promise(async (res, rej) => {
			console.log(server, role);
			try {
				var data = await this.db.query(`SELECT * FROM server_roles WHERE server_id = $1 AND role_id = $2`, [server, role]);
			} catch(e) {
				console.log(e);
				return rej(e.message);
			}

			var guild = this.bot.guilds.resolve(server);
			if(!guild) return rej("Couldn't get guild");
			
			if(data.rows && data.rows[0]) {
				var rl;
				for(var i = 0; i < data.rows.length; i++) {
					rl = guild.roles.cache.find(r => r.id == data.rows[i].role_id);
					if(!rl || rl.deleted) {
						this.delete(data.rows[i].server_id, data.rows[i].role_id);
						data.rows[i] = "deleted";
					} else data.rows[i].raw = rl;
				}
				data.rows = data.rows.filter(x => x != "deleted");
				if(!data.rows || !data.rows[0]) return res(undefined);
				res(data.rows[0])
			} else res(undefined);
		})
	}

	async getAll(server) {
		return new Promise(async (res, rej) => {
			try {
				var data = await this.db.query(`SELECT * FROM server_roles WHERE server_id = $1`,[server]);
			} catch(e) {
				console.log(e);
				return rej(e.message);
			}

			var guild = this.bot.guilds.resolve(server);
			if(!guild) return rej("Couldn't get guild");
			
			if(data.rows && data.rows[0]) {
				var rl;
				for(var i = 0; i < data.rows.length; i++) {
					rl = guild.roles.cache.find(r => r.id == data.rows[i].role_id);
					if(!rl || rl.deleted) {
						this.delete(data.rows[i].server_id, data.rows[i].role_id);
						data.rows[i] = "deleted";
					} else data.rows[i].raw = rl;
				}
				data.rows = data.rows.filter(x => x != "deleted");
				if(!data.rows || !data.rows[0]) return res(undefined);
				res(data.rows)
			} else res(undefined);
		})
	}

	async update(server, role, data = {}) {
		return new Promise(async (res, rej) => {
			try {
				await this.db.query(`UPDATE server_roles SET ${Object.keys(data).map((k, i) => k+"=$"+(i+3)).join(",")} WHERE server_id = $1 AND role_id = $2`,[server, role, ...Object.values(data)]);
			} catch(e) {
				console.log(e);
				return rej(e.message);
			}

			res(await this.get(server, role, true));
		})
	}

	async delete(server, role) {
		return new Promise(async (res, rej) => {
			try {
				await this.db.query(`DELETE FROM server_roles WHERE server_id = $1 AND role_id = $2`, [server, role]);
			} catch(e) {
				console.log(e);
				return rej(e.message);
			}
			
			res();
		})
	}

	async deleteMass(server, ids) {
		return new Promise(async (res, rej) => {
			var roles = await this.getAll(server);
			try {
				await this.db.query(`BEGIN`);
				for(var role of roles) {
					if(!ids.includes(role.role_id)) continue;
					this.db.query(`DELETE FROM server_roles WHERE server_id = $1 AND role_id = $2`, [server, role.role_id]);
				}
				await this.db.query(`COMMIT`);
			} catch(e) {
				console.log(e);
				await this.db.query(`ROLLBACK`);
				return rej(e.message);
			}
			res();
		})
	}

	async deleteAll(server) {
		return new Promise(async (res, rej) => {
			var roles = await this.getAll(server);
			try {
				await this.db.query(`DELETE FROM server_roles WHERE server_id = $1`, [server]);
			} catch(e) {
				console.log(e);
				return rej(e.message);
			}
			
			res();
		})
	}
}

module.exports = (bot, db) => new ServerRoleStore(bot, db);