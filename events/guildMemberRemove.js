module.exports = async (member, bot)=> {
	var role = await bot.stores.userRoles.getRaw(member.guild.id, member.id);
	if(!role) return;
	role.delete("Member left server");
}