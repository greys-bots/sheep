module.exports = async (member, bot)=> {
	var role = await bot.stores.userRoles.getRaw(member.guild.id, member.id);
	if(!role) return;
	try {
		var rl = member.guild.roles.resolve(role.role_id);
		if(rl) role.delete("Member left server");
	} catch(e) {
		console.log(e);
	}
}