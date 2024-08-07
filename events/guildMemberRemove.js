module.exports = async (member, bot)=> {
	if(process.env.TESTING && member.guild.id !== process.env.TEST_GUILD)
		return;

	var role = await bot.stores.userRoles.getRaw(member.guild.id, member.id);
	if(!role) return;

	var linked = await bot.stores.userRoles.getLinked(member.guild.id, role.role_id);
	if(linked?.length && linked.find(x => x.id !== role.id)) {
		await role.delete();
		return;
	}

	try {
		var rl = await member.guild.roles.fetch(role.role_id);
		if(rl) rl.delete("Member left server");
	} catch(e) {
		console.log(e);
	}
}