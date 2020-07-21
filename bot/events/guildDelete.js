module.exports = async (guild, bot) => {
	try {
		await bot.stores.serverRoles.deleteAll(guild.id);
	} catch(e) {
		console.log("Couldn't delete data for guild "+guild.id);
	}
}