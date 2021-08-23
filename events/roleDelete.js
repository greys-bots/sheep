module.exports = async (role, bot) => {
	try {
		await bot.stores.serverRoles.delete(role.guild.id, role.id);
		await bot.stores.userRoles.delete(role.guild.id, role.id);
	} catch(e) {
		console.log("Couldn't delete data on deleted role "+role.id);
	}
}