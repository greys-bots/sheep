module.exports = {
	getConfig: async (bot, guild) => {
		return new Promise(res => {
			bot.db.query(`SELECT * FROM configs WHERE server_id = ?`, [guild], {
				id: Number,
				server_id: String,
				role_mode: Number,
				disabled: val => val ? JSON.parse(val) : null,
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
	updateConfig: async function(bot, server, data) {
		var config = await bot.utils.getConfig(bot, server);
		return new Promise((res)=> {
			if(config) {
				bot.db.query(`UPDATE configs SET ${Object.keys(data).map((k) => k+"=?").join(",")} WHERE server_id=?`,[...Object.values(data), server], (err, rows)=> {
					if(err) {
						console.log(err);
						res(false)
					} else res(true)
				})
			} else {
				bot.db.query(`INSERT INTO configs (server_id, ${Object.keys(data).join(",")}) VALUES (?,${Object.keys(data).map(() => "?").join(",")})`,
							 [server, ...Object.values(data)],
				(err,rows)=>{
					if(err) {
						console.log(err);
						res(false);
					} else res(true);
				})
			}
		})
	}
}