module.exports = async (guild, role, bot) => {
	try {
		await bot.utils.deleteServerRole(bot, guild.id, role.id);
		await bot.utils.deleteUserRole(bot, guild.id, role.id);
	} catch(e) {
		console.log("Couldn't delete data on deleted role "+role.id);
	}
}