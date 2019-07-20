module.exports = {
	help: ()=> "Removes your color",
	usage: ()=> [" - Removes the color role you have"],
	execute: async (bot, msg, args)=> {
		var role = msg.guild.roles.find(r => r.name == msg.author.id);
		if(!role) return "You don't have a color role!";
		role.delete();
		return 'Color successfully removed! :D';
	},
	alias: ['r', 'rmv', 'clear', 'delete']
}