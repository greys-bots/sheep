module.exports = async (role, bot) => {
	if(process.env.TESTING && role.guild.id !== process.env.TEST_GUILD)
		return;

	try {
		var sr = await bot.stores.serverRoles.getRaw(role.guild.id, role.id);
		if(sr) await sr.delete();
		var ur = await bot.stores.userRoles.getByRoleRaw(role.guild.id, role.id);
		if(ur) await ur.delete();
	} catch(e) {
		console.log("Couldn't delete data on deleted role "+role.id);
	}
}