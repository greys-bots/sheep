module.exports = async (member, bot)=> {
	var role = await bot.stores.userRoles.get(member.guild, member);
	if(!role) return;
	role.delete("Member left server");
}