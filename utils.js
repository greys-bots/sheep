module.exports = {
	checkPermissions: async (bot, msg, cmd)=>{
		return new Promise((res)=> {
			if(cmd.permissions) {
				console.log(cmd.permissions.filter(p => msg.member.permission.has(p)).length)
				if(!cmd.permissions.filter(p => msg.member.permission.has(p)).length == cmd.permissions.length) {
					res(false);
					return;
				}
				res(true);
			} else {
				res(true);
			}
		})
	},
	getConfig: async (bot, guild) => {
		return new Promise(res => {
			bot.db.query(`SELECT * FROM configs WHERE server_id = ?`, [guild], {
				id: Number,
				server_id: String,
				role_mode: Number
			}, (err, rows) => {
				if(err) {
					console.log(err);
					res(undefined)
				} else {
					res(rows[0]);
				}
			})
		})
	},
	updateConfig: async (bot, guild, mode) => {
		return new Promise(async res => {
			var config = await bot.utils.getConfig(bot, guild);
			if(config) {
				bot.db.query(`UPDATE configs SET role_mode = ? WHERE server_id = ?`,[mode, guild], (err, rows) => {
					if(err) {
						console.log(err);
						res(false);
					} else {
						res(true);
					}
				})
			} else {
				bot.db.query(`INSERT INTO configs (server_id, role_mode) VALUES (?,?)`,[guild, mode], (err, rows) => {
					if(err) {
						console.log(err);
						res(false);
					} else {
						res(true);
					}
				})
			}
		})
	},
	getServerRoles: async (bot, guild) => {
		return new Promise(res => {
			bot.db.query(`SELECT * FROM colors WHERE server_id = ? AND type = 1`,[guild.id], (err, rows) => {
				if(err) {
					console.log(err);
					res(undefined);
				} else {
					
					res(rows.map(r => {
						var role = guild.roles.find(rl => rl.id == r.role_id);
						if(role) return {name: role.name, id: role.id, color: role.color};
						else return {name: "invalid", id: r.role_id};
					}));
				}
			})
		})
	},
	getServerRole: async (bot, guild, role) => {
		return new Promise(res => {
			bot.db.query(`SELECT * FROM colors WHERE server_id = ? AND role_id = ?`,[guild, role], (err, rows) => {
				if(err) {
					console.log(err);
					res(undefined);
				} else {
					res(rows[0])
				}
			})
		})
	},
	addServerRole: async (bot, guild, role) => {
		return new Promise(res => {
			bot.db.query(`INSERT INTO colors (server_id, role_id, type) VALUES (?,?,?)`, [guild, role, 1], (err, rows) => {
				if(err) {
					console.log(err);
					res(false)
				} else {
					res(true)
				}
			})
		})
	},
	resetServerRoles: async (bot, guild) => {
		return new Promise(res => {
			bot.db.query(`DELETE FROM colors WHERE server_id = ? AND type = 1`, [guild], (err, rows) => {
				if(err) {
					console.log(err);
					res(false)
				} else {
					res(true)
				}
			})
		})
	},
	deleteServerRoles: async (bot, guild, roles) => {
		return new Promise(res => {
			bot.db.query(`DELETE FROM colors WHERE server_id = ? AND role_id IN (${roles.join(", ")})`, [guild], (err, rows) => {
				if(err) {
					console.log(err);
					res(false);
				} else {
					res(true);
				}
			})
		})
	},
	getUserRole: async (bot, guild, user) => {
		return new Promise(res => {
			var role;
			role = guild.roles.find(r => r.name == user);
			if(!role) {
				bot.db.query(`SELECT * FROM colors WHERE user_id = ? AND server_id = ?`,[user, guild.id], (err, rows) => {
					if(err) {
						console.log(err);
						res(undefined)
					} else {
						if(rows[0]) {
							res(rows[0].role_id);
						} else {
							res(undefined);
						}
					}
				})
			} else {
				res(role.id);
			}
		})
	},
	setName: async (bot, guild, role, user, name) => {
		return new Promise(async res => {
			try {
				await bot.editRole(guild, role, {name: name});
			} catch(e) {
				console.log(e);
				return res(false);
			}
			bot.db.query(`INSERT OR IGNORE INTO colors (server_id, role_id, user_id, type) VALUES (?,?,?,?)`,[guild, role, user, 0], (err, rows) => {
				if(err) {
					console.log(err);
					res(false);
				} else {
					res(true)
				}
			})
		})
	},
	deleteUserRole: async (bot, role) => {
		return new Promise(async res => {
			bot.db.query(`DELETE FROM colors WHERE role_id = ?`, [role], (err, rows) => {
				if(err) {
					console.log(err);
					res(false);
				} else {
					res(true);
				}
			})
		})
	}
}