module.exports = async (guild, role, bot) => {
	try {
		await bot.stores.serverRoles.delete(guild.id, role.id);
		await bot.stores.userRoles.delete(guild.id, role.id);
	} catch(e) {
		console.log("Couldn't delete data on deleted role "+role.id);
	}
}