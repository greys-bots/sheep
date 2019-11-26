module.exports = {
	genEmbeds: async (bot, arr, genFunc, info = {}, fieldnum) => {
		return new Promise(async res => {
			var embeds = [];
			var current = { embed: {
				title: info.title,
				description: info.description,
				fields: []
			}};
			
			for(let i=0; i<arr.length; i++) {
				if(current.embed.fields.length < (fieldnum || 10)) {
					current.embed.fields.push(await genFunc(arr[i], bot));
				} else {
					embeds.push(current);
					current = { embed: {
						title: info.title,
						description: info.description,
						fields: [await genFunc(arr[i], bot)]
					}};
				}
			}
			embeds.push(current);
			if(embeds.length > 1) {
				for(let i = 0; i < embeds.length; i++)
					embeds[i].embed.title += ` (page ${i+1}/${embeds.length}, ${arr.length} total)`;
			}
			res(embeds);
		})
	},
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
				role_mode: Number,
				disabled: JSON.parse,
				pingable: Boolean
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
	updateConfig: async (bot, guild, key, val) => {
		return new Promise(async res => {
			var config = await bot.utils.getConfig(bot, guild);
			if(config) {
				bot.db.query(`UPDATE configs SET ? = ? WHERE server_id = ?`,[key, val, guild], (err, rows) => {
					if(err) {
						console.log(err);
						res(false);
					} else {
						res(true);
					}
				})
			} else {
				bot.db.query(`INSERT INTO configs (server_id, role_mode, disabled, pingable) VALUES (?,?,?,?)`,
					[guild, key == "role_mode" ? val : 0,
					key == "disabled" ? val : [], key == "pingable" ? val : 0], (err, rows) => {
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

	getManagedRoles: async (bot, guild) => {
		return new Promise(res => {
			bot.db.query(`SELECT * FROM colors WHERE server_id = ?`,[guild], (err, rows) => {
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
	deleteServerRole: async (bot, guild, role) => {
		return new Promise(res => {
			bot.db.query(`DELETE FROM colors WHERE server_id = ? AND role_id = ?`, [guild, role], (err, rows) => {
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
	getUserRole: async (bot, guild, user) => {
		return new Promise(res => {
			var role;
			bot.db.query(`SELECT * FROM colors WHERE user_id = ? AND server_id = ?`,[user, guild.id], (err, rows) => {
				if(err) {
					console.log(err);
					res(undefined)
				} else {
					if(rows[0]) {
						role = guild.roles.find(r => r.id == rows[0].role_id);
						if(!role) {
							res(undefined)
						} else res(role.id);
					} else {
						role = guild.roles.find(r => r.name == user);
						res(role ? role.id : undefined);
					}
				}
			})
		})
	},
	getRawUserRole: async (bot, guild, user) => {
		return new Promise(res => {
			var role;
			bot.db.query(`SELECT * FROM colors WHERE user_id = ? AND server_id = ?`,[user, guild.id], (err, rows) => {
				if(err) {
					console.log(err);
					res(undefined)
				} else {
					if(rows[0]) {
						role = guild.roles.find(r => r.id == rows[0].role_id);
						if(!role) {
							res(undefined)
						} else res(role);
					} else {
						role = guild.roles.find(r => r.name == user);
						res(role ? role : undefined);
					}
				}
			})
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
			var scc = await bot.utils.addUserRole(bot, guild, role, user);
			res(scc);
		})
	},
	addUserRole: async (bot, guild, role, user) => {
		return new Promise(res => {
			bot.db.query(`SELECT * FROM colors WHERE server_id=? AND role_id=? AND user_id=?`,[guild, role, user], (err, rows)=> {
				if(err) {
					console.log(err);
					res(false);
				} else {
					if(rows[0]) return res(true);
					bot.db.query(`INSERT INTO colors (server_id, role_id, user_id, type) VALUES (?,?,?,?)`,[guild, role, user, 0], (err, rows) => {
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
	deleteUserRole: async (bot, guild, role) => {
		return new Promise(async res => {
			bot.db.query(`DELETE FROM colors WHERE server_id = ? AND role_id = ?`, [guild, role], (err, rows) => {
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
			bot.db.query(`DELETE FROM colors WHERE server_id = ?`, [guild], (err, rows) => {
				if(err) {
					console.log(err);
					res(false);
				} else {
					res(true);
				}
			})
		})
	},
	toCmyk: async (color) => {
		//code based on this: http://www.javascripter.net/faq/rgb2cmyk.htm
		return new Promise(res => {
			var rgb = color.toRgb();
			if(rgb.r == 0 && rgb.g == 0 && rgb.b == 0) return res({c: 0, m: 0, y: 0, k: 1});

			var c = 1 - rgb.r/255;
			var m = 1 - rgb.g/255;
			var y = 1 - rgb.b/255;

			var k = Math.min(c, Math.min(m, y));
			c = (c - k)/(1 - k);
			m = (m - k)/(1 - k);
			y = (y - k)/(1 - k);

			res({c, m, y, k});
		})
	},
	mixColors: async (bot, c1, c2) => {
		return new Promise(async res => {
			c1 = c1.toHex();
			c2 = c2.toHex();
			var c = "";
			for(var i = 0; i<3; i++) {
			  var sub1 = c1.substring(2*i, 2+2*i);
			  var sub2 = c2.substring(2*i, 2+2*i);
			  var v1 = parseInt(sub1, 16);
			  var v2 = parseInt(sub2, 16);
			  var v = Math.floor((v1 + v2) / 2);
			  var sub = v.toString(16).toUpperCase();
			  var padsub = ('0'+sub).slice(-2);
			  c += padsub;
			}
			res(bot.tc(c));
		})
	},
	isDisabled: async (bot, srv, cmd, name) =>{
		return new Promise(async res=>{
			var cfg = await bot.utils.getConfig(bot, srv);
			if(!cfg || !cfg.disabled || !cfg.disabled[0]) return res(false);
			let dlist = cfg.disabled;
			name = name.split(" ");
			if(dlist && (dlist.includes(name[0]) || dlist.includes(name.join(" ")))) {
				res(true);
			} else {
				res(false);
			}
		})
	}
}