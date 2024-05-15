module.exports = async (guild, bot) => {
	if(process.env.TESTING && guild.id !== process.env.TEST_GUILD)
		return;

	try {
		await bot.stores.serverRoles.deleteAll(guild.id);
	} catch(e) {
		console.log("Couldn't delete data for guild "+guild.id);
	}
}