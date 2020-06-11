module.exports = async (member, bot)=> {
	var role = await bot.stores.userRoles.getRaw(member.guild.id, member.id);
	if(!role || role.raw == "deleted") return;
	role.raw.delete("Member left server");
}