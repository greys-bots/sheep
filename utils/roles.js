module.exports = {
	getManagedRoles: async (bot, guild) => {
		return new Promise(res => {
			bot.db.query(`SELECT * FROM roles WHERE server_id = ?`,[guild], (err, rows) => {
				if(err) {
					console.log(err);
					res(undefined);
				} else {
					res(rows.map(r => r.role_id));
				}
			})
		})
	},
	getServerRoles: async (bot, guild) => {
		return new Promise(res => {
			bot.db.query(`SELECT * FROM roles WHERE server_id = ? AND type = 1`,[guild.id], (err, rows) => {
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
			bot.db.query(`SELECT * FROM roles WHERE server_id = ? AND role_id = ?`,[guild, role], (err, rows) => {
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
			bot.db.query(`INSERT INTO roles (server_id, role_id, type) VALUES (?,?,?)`, [guild, role, 1], (err, rows) => {
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
			bot.db.query(`DELETE FROM roles WHERE server_id = ? AND type = 1`, [guild], (err, rows) => {
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
			bot.db.query(`DELETE FROM roles WHERE server_id = ? AND role_id IN (${roles.join(", ")})`, [guild], (err, rows) => {
				if(err) {
					console.log(err);
					res(false);
				} else {
					res(true);
				}
			})
		})
	},
	deleteServerRole: async (bot, guild, role) => {
		return new Promise(res => {
			bot.db.query(`DELETE FROM roles WHERE server_id = ? AND role_id = ?`, [guild, role], (err, rows) => {
				if(err) {
					console.log(err);
					res(false);
				} else {
					console.log("Deleted server role")
					res(true);
				}
			})
		})
	},
	getUserRole: async (bot, guild, member) => {
		return new Promise(res => {
			var role;
			bot.db.query(`SELECT * FROM roles WHERE user_id = ? AND server_id = ?`,[member.id, guild.id], (err, rows) => {
				if(err) {
					console.log(err);
					res(undefined)
				} else {
					if(rows[0]) {
						for(var i = 0; i < rows.length; i++) {
							role = guild.roles.find(r => r.id == rows[i].role_id);
							if(!role || !member.roles.find(r => r.id == rows[i].role_id)) {
								bot.utils.deleteUserRole(bot, rows[i].server_id, rows[i].role_id);
								rows[i] = "deleted";
							} else rows[i] = role;
						}
						rows = rows.filter(x => x != "deleted");
						if(!rows || !rows[0]) res(undefined);
						else res(rows[0].id);
					} else {
						role = guild.roles.find(r => r.name == member.id);
						res(role ? role.id : undefined);
					}
				}
			})
		})
	},
	getRawUserRole: async (bot, guild, member) => {
		return new Promise(res => {
			bot.db.query(`SELECT * FROM roles WHERE user_id = ? AND server_id = ?`,[member.id, guild.id], async (err, rows) => {
				if(err) {
					console.log(err);
					res(undefined)
				} else {
					var role;
					if(rows[0]) {
						for(var i = 0; i < rows.length; i++) {
							role = guild.roles.find(r => r.id == rows[i].role_id);
							if(!role || !member.roles.find(r => r.id == rows[i].role_id)) {
								bot.utils.deleteUserRole(bot, rows[i].server_id, rows[i].role_id);
								rows[i] = "deleted";
							} else rows[i] = role;
						}
						rows = rows.filter(x => x != "deleted");
						if(!rows || !rows[0]) res(undefined);
						else res(rows[0]);
					} else {
						role = guild.roles.find(r => r.name == member.id);
						if(!role) res(undefined);
						else res(role);
					}
				}
			})
		})
	},
	addUserRole: async (bot, guild, role, user) => {
		return new Promise(res => {
			bot.db.query(`SELECT * FROM roles WHERE server_id=? AND role_id=? AND user_id=?`,[guild, role, user], (err, rows)=> {
				if(err) {
					console.log(err);
					res(false);
				} else {
					if(rows[0]) return res(true);
					bot.db.query(`INSERT INTO roles (server_id, role_id, user_id, type) VALUES (?,?,?,?)`,[guild, role, user, 0], (err, rows) => {
						if(err) {
							console.log(err);
							res(false);
						} else {
							res(true)
						}
					})
				}
			})
		})
	},
	setName: async (bot, guild, role, user, name) => {
		return new Promise(async res => {
			try {
				await role.edit({name: name});
			} catch(e) {
				console.log(e);
				return res(false);
			}
			var scc = await bot.utils.addUserRole(bot, guild, role.id, user);
			res(scc);
		})
	},
	deleteUserRole: async (bot, guild, role) => {
		return new Promise(async res => {
			bot.db.query(`DELETE FROM roles WHERE server_id = ? AND role_id = ?`, [guild, role], (err, rows) => {
				if(err) {
					console.log(err);
					res(false);
				} else {
					console.log("Deleted user role")
					res(true);
				}
			})
		})
	},
	deleteColorRoles: async (bot, guild) => {
		return new Promise(async res => {
			bot.db.query(`DELETE FROM roles WHERE server_id = ?`, [guild], (err, rows) => {
				if(err) {
					console.log(err);
					res(false);
				} else {
					res(true);
				}
			})
		})
	},
	unlinkUserRole: async (bot, guild, role, user) => {
		return new Promise(async res => {
			bot.db.query(`DELETE FROM roles WHERE server_id = ? AND role_id = ? AND user_id = ?`, [guild, role, user], (err, rows) => {
				if(err) {
					console.log(err);
					res(false);
				} else {
					console.log("Deleted user role")
					res(true);
				}
			})
		})
	},
	handleChangeReacts: async function (bot, m, reaction, user, config = {pingable: false}) {
		var member = m.guild.members.find(mb => mb.id == user.id);
		switch(reaction.emoji.name) {
			case '\u2705':
				var srole = m.guild.me.roles.find(r => r.name.toLowerCase() == "sheep");
				var role = await bot.utils.getRawUserRole(bot, m.guild, member);
				console.log(srole.rawPosition);
				var options = {
					name: role ? role.name : member.id,
					color: this.data.toHex(),
					position: srole ? srole.rawPosition - 1 : 0,
					mentionable: config.pingable
				}

				try {
					if(role) {
						console.log(role.rawPosition);
						role = await role.edit(options);
					} else {
						role = await m.guild.roles.create({data: options});
					}
					console.log(role.rawPosition);
					await member.roles.add(role.id);
					await m.edit("Color successfully changed to "+this.data.toHexString()+"! :D", {embed: null});
					await m.reactions.removeAll();
					delete bot.menus[m.id];
					await bot.utils.addUserRole(bot, m.guild.id, role.id, member.id);
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
				var color = bot.tc(Math.floor(Math.random()*16777215).toString(16));
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
						m.removeReactions()
						delete bot.menus[m.id];
					}, 900000),
					execute: this.execute
				};
				break;
		}
	}
}