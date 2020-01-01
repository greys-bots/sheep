module.exports = async (guild, bot) => {
	try {
		await bot.utils.deleteColorRoles(bot, guild.id);
	} catch(e) {
		console.log("Couldn't delete data for guild "+guild.id);
	}
}