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
				var member = await guild.members.fetch(user);	
			} catch(e) {
				console.log("Couldn't get user: "+e.message);
			}
			
			if(!member) return rej("Couldn't get user");
			
			if(data.rows && data.rows[0]) {
				var role;
				for(var i = 0; i < data.rows.length; i++) {
					role = guild.roles.cache.find(r => r.id == data.rows[i].role_id);
					if(!role || role.deleted || !member.roles.cache.find(r => r.id == data.rows[i].role_id)) {
						console.log(`deleting role ${data.rows[i].role_id}`);
						this.deleteByRoleID(data.rows[i].server_id, data.rows[i].role_id);
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

			if(data.rows && data.rows[0]) {
				var role;
				for(var i = 0; i < data.rows.length; i++) {
					role = guild.roles.cache.find(r => r.id == data.rows[i].role_id);
					if(!role || role.deleted || !member.roles.cache.find(r => r.id == data.rows[i].role_id)) {
						console.log(`deleting role ${data.rows[i].role_id}`);
						this.deleteByRoleID(data.rows[i].server_id, data.rows[i].role_id);
						data.rows[i] = "deleted";
					} else data.rows[i].raw = role;
				}
				data.rows = data.rows.filter(x => x != "deleted");
				if(!data.rows || !data.rows[0]) return res(undefined);
				res(data.rows)
			} else {
				role = guild.roles.cache.find(r => r.name == user);
				if(!role) res(undefined);
				else res(role);
			}
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

	async handleReactions(bot, m, reaction, user) {
		var config = (await bot.stores.configs.get(m.guild.id)) || {pingable: false};
		var member = await m.guild.members.fetch(user.id);
		switch(reaction.emoji.name) {
			case '\u2705':
				var srole = m.guild.me.roles.cache.find(r => r.name.toLowerCase().includes("sheep") || r.managed);
				var role = await bot.stores.userRoles.get(m.guild.id, member.id);
				console.log(srole ? srole.position : "No sheep role");
				var options = {
					name: role ? role.raw.name : member.id,
					color: this.data.toHex(),
					position: srole ? srole.position - 1 : 0,
					mentionable: config.pingable
				}

				try {
					if(role && role.raw && !role.raw.deleted) {
						console.log(role.raw.position);
						role = await role.raw.edit(options);
					} else {
						role = await m.guild.roles.create({data: options});
						role.new = true;
					}
					console.log(role.position);
					await member.roles.add(role.id);
					await m.edit("Color successfully changed to "+this.data.toHexString()+"! :D", {embed: null});
					await m.reactions.removeAll();
					delete bot.menus[m.id];
					if(role.new) await bot.stores.userRoles.create(m.guild.id, member.id, role.id);
				} catch(e) {
					console.log(e.stack);
					m.channel.send(`Something went wrong! ERR: ${e.message}\nIf the error continues, please report this in my development server: https://discord.gg/EvDmXGt`);
				}
				break;
			case '\u274C':
				m.edit("Action cancelled", {embed: null});
				m.reactions.removeAll();
				delete bot.menus[m.id];
				break
			case '🔀':
				var color = bot.tc.random();
				m.edit({embed: {
					title: "Color "+color.toHexString().toUpperCase(),
					image: {
						url: `https://sheep.greysdawn.com/sheep/${color.toHex()}`
					},
					color: parseInt(color.toHex(), 16),
					footer: {
						text: `${color.toRgbString()}`
					}
				}})
				await reaction.users.remove(member.id);
				clearTimeout(bot.menus[m.id].timeout)
				bot.menus[m.id] = {
					user: this.user,
					data: color,
					timeout: setTimeout(()=> {
						if(!bot.menus[m.id]) return;
						m.reactions.removeAll()
						delete bot.menus[m.id];
					}, 900000),
					execute: this.execute
				};
				break;
		}
	}
}

module.exports = (bot, db) => new UserRoleStore(bot, db);