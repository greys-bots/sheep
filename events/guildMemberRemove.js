module.exports = async (member, bot)=> {
	var role = await bot.utils.getRawUserRole(bot, member.guild, member);
	if(!role) return;
	role.delete("Member left server");
}