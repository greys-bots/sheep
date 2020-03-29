module.exports = {
	getSavedColors: async (bot, user) => {
		return new Promise(res => {
			bot.db.query(`SELECT * FROM colors WHERE user_id = ?`, [user], {
				id: Number,
				user_id: String,
				name: String,
				color: String
			}, (err, rows) => {
				if(err) {
					console.log(err);
					res(undefined);
				} else res(rows);
			})
		})
	},
	getSavedColor: async (bot, user, name) => {
		return new Promise(res => {
			bot.db.query(`SELECT * FROM colors WHERE user_id = ? AND LOWER(name) = ?`, [user, name.toLowerCase()], {
				id: Number,
				user_id: String,
				name: String,
				color: String
			}, (err, rows) => {
				if(err) {
					console.log(err);
					res(undefined);
				} else res(rows[0]);
			})
		})
		
	},
	saveColor: async (bot, user, name, color) => {
		return new Promise(res => {
			bot.db.query(`INSERT INTO colors (user_id, name, color) VALUES (?,?,?)`, [user, name, color], (err, rows) => {
				if(err) {
					console.log(err);
					res(false);
				} else res(true);
			})
		})
	},
	updateSavedColor: async (bot, user, name, data) => {
		return new Promise(res => {
			bot.db.query(`UPDATE colors SET ${Object.keys(data).map((k) => k+"=?").join(",")} WHERE user_id = ? AND LOWER(name) = ?`, [...Object.values(data), user, name.toLowerCase()], (err, rows) => {
				if(err) {
					console.log(err);
					res(false);
				} else res(true);
			})
		})
	},
	deleteSavedColor: async (bot, user, name) => {
		return new Promise(res => {
			bot.db.query(`DELETE FROM colors WHERE user_id = ? AND LOWER(name) = ?`, [user, name.toLowerCase()], (err, rows) => {
				if(err) {
					console.log(err);
					res(false);
				} else res(true);
			})
		})
	},
	deleteSavedColors: async (bot, user) => {
		return new Promise(res => {
			bot.db.query(`DELETE FROM colors WHERE user_id = ?`, [user], (err, rows) => {
				if(err) {
					console.log(err);
					res(false);
				} else res(true);
			})
		})
	},
	importSavedColors: async (bot, user, data) => {
		return new Promise(async res => {
			var colors = await bot.utils.getSavedColors(bot, user);
			for(var color of data) {
				if(colors.find(c => c.name == color.name)) await bot.utils.updateSavedColor(bot, user, color.name, {color: color.color});
				else await bot.utils.saveColor(bot, user, color.name, color.color);
			}
			return res(true);
		})
	}
}