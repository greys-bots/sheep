const {Collection} = require("discord.js");

class UserRoleStore extends Collection {
	constructor(bot, db) {
		super();

		this.db = db;
		this.bot = bot;
	};

	// relies on menu currently, so don't need this
	// might change later?
	// async init() {
	// 	this.bot.on("messageReactionAdd", (...args) => {
	// 		try {
	// 			this.handleReactions(...args)
	// 		} catch(e) {
	// 			console.log(e);
	// 		}
	// 	})
	// }

	async create(server, user, role) {
		return new Promise(async (res, rej) => {
			try {
				await this.db.query(`INSERT INTO user_roles (
					server_id,
					user_id,
					role_id
				) VALUES ($1,$2,$3)`,
				[server, user, role]);
			} catch(e) {
				console.log(e);
		 		return rej(e.message);
			}

			res(await this.get(server, user));
		})
	}

	async index(server, user, role) {
		return new Promise(async (res, rej) => {
			try {
				await this.db.query(`INSERT INTO user_roles (
					server_id,
					user_id,
					role_id
				) VALUES ($1,$2,$3)`,
				[server, user, role]);
			} catch(e) {
				console.log(e);
		 		return rej(e.message);
			}
			
			res();
		})
	}

	//no caching thanks to it messing with deleted roles
	async get(server, user, forceUpdate = false) {
		return new Promise(async (res, rej) => {
			try {
				var data = await this.db.query(`SELECT * FROM user_roles WHERE server_id = $1 AND user_id = $2`,[server, user]);
			} catch(e) {
				console.log(e);
				return rej(e.message);
			}

			if(!this.bot) return res(data.rows[0]);

			var guild = this.bot.guilds.resolve(server);
			if(!guild) return rej("Couldn't get guild");
			try {
				var member = await guild.members.fetch({user, force: true});
			} catch(e) {
				console.log("Couldn't get member: "+e.message);
			}
			
			if(data.rows && data.rows[0]) {
				var role;
				for(var i = 0; i < data.rows.length; i++) {
					try { 
						role = await guild.roles.fetch(data.rows[i].role_id);
					} catch(e) { }
					
					if(!role || role.deleted) {
						console.log(`removing role ${data.rows[i].role_id} from database`);
						this.deleteByRoleID(data.rows[i].server_id, data.rows[i].role_id);
						data.rows[i] = "deleted";
					} else if(!member.roles.cache.has(role.id) && data.length > 1) {
						console.log(`deleting role ${data.rows[i].role_id}`);
						await role.delete();
						data.rows[i] = "deleted";
					} else data.rows[i].raw = role;
				}
				data.rows = data.rows.filter(x => x != "deleted");
				if(!data.rows || !data.rows[0]) return res(undefined);
				res(data.rows[0])
			} else {
				role = guild.roles.cache.find(r => r.name == user);
				if(!role) res(undefined);
				else {
					return res(await this.create(server, user, role.id));
				}
			}
		})
	}

	//specifically for getting roles to delete after a member leaves a server
	//above function returns "unknown member," this won't
	async getRaw(server, user) {
		return new Promise(async (res, rej) => {
			try {
				var data = await this.db.query(`SELECT * FROM user_roles WHERE server_id = $1 AND user_id = $2`,[server, user]);
			} catch(e) {
				console.log(e);
				return rej(e.message);
			}

			if(data.rows && data.rows[0]) {
				res(data.rows[0])
			} else res(undefined);
		})
	}

	async getByRoleID(server, role) {
		return new Promise(async (res, rej) => {
			try {
				var data = await this.db.query(`SELECT * FROM user_roles WHERE server_id = $1 AND role_id = $2`, [server, role]);
			} catch(e) {
				console.log(e);
				return rej(e.message);
			}

			res(data.rows[0]);
		})
	}

	async getAll(server) {
		return new Promise(async (res, rej) => {
			try {
				var data = await this.db.query(`SELECT * FROM user_roles WHERE server_id = $1`, [server]);
			} catch(e) {
				console.log(e);
				return rej(e.message);
			}

			var guild = this.bot.guilds.resolve(server);
			if(!guild) return rej("Couldn't get guild");

			if(data.rows && data.rows[0]) {
				for(var i = 0; i < data.rows.length; i++) {
					var role;
					role = guild.roles.cache.find(r => r.id == data.rows[i].role_id);
					if(!role || role.deleted) {
						console.log(`deleting role ${data.rows[i].role_id}`);
						this.deleteByRoleID(data.rows[i].server_id, data.rows[i].role_id);
						data.rows[i] = "deleted";
					} else data.rows[i].raw = role;
				}
				data.rows = data.rows.filter(x => x != "deleted");
				if(!data.rows || !data.rows[0]) return res(undefined);
				res(data.rows)
			} else res(undefined);
		})
	}

	async getAllRaw(server) {
		return new Promise(async (res, rej) => {
			try {
				var data = await this.db.query(`SELECT * FROM user_roles WHERE server_id = $1`, [server]);
			} catch(e) {
				console.log(e);
				return rej(e.message);
			}

			if(data.rows && data.rows[0]) {
				res(data.rows)
			} else res(undefined);
		})
	}

	async getAllByUserRaw(user) {
		return new Promise(async (res, rej) => {
			try {
				var data = await this.db.query(`SELECT * FROM user_roles WHERE user_id = $1`, [user]);
			} catch(e) {
				console.log(e);
				return rej(e.message);
			}

			if(data.rows && data.rows[0]) {
				res(data.rows)
			} else res(undefined);
		})
	}

	async update(server, user, data = {}) {
		return new Promise(async (res, rej) => {
			try {
				await this.db.query(`UPDATE user_roles SET ${Object.keys(data).map((k, i) => k+"=$"+(i+3)).join(",")} WHERE server_id = $1 AND user_id = $2`,[server, user, ...Object.values(data)]);
			} catch(e) {
				console.log(e);
				return rej(e.message);
			}

			res(await this.get(server, user, true));
		})
	}

	async delete(server, user) {
		return new Promise(async (res, rej) => {
			try {
				await this.db.query(`DELETE FROM user_roles WHERE server_id = $1 AND user_id = $2`, [server, user]);
			} catch(e) {
				console.log(e);
				return rej(e.message);
			}
			
			res();
		})
	}

	async deleteByRoleID(server, role) {
		return new Promise(async (res, rej) => {
			try {
				await this.db.query(`DELETE FROM user_roles WHERE server_id = $1 AND role_id = $2`, [server, role]);
			} catch(e) {
				console.log(e);
				return rej(e.message);
			}
			
			res();
		})
	}

	async unlink(guild, role, user) {
		return new Promise(async (res, rej) => {
			try {
				this.db.query(`DELETE FROM user_roles WHERE server_id = $1 AND role_id = $2 AND user_id = $3`, [guild, role, user]);
			} catch(e) {
				console.log(e);
				return rej(e.message);
			}

			res();
		})
	}
}

module.exports = (bot, db) => new UserRoleStore(bot, db);