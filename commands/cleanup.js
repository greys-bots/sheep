module.exports = {
	help: ()=> "Cleans up Hex roles and makes them compatible with Sheep",
	usage: ()=> [" - Removes the `USER-` prefix on roles created by Hex to make the compatible with this bot"],
	desc: ()=> "NOTE: this role requires the `manageRoles` permission from the user. This effectively makes it moderator-only",
	execute: async (bot, msg, args)=> {
		if(!msg.member.permission.has('manageRoles')) return msg.channel.createMessage('You do not have permission to use this command :(');

		msg.guild.roles.forEach(r => {
			if(r.name.startsWith('USER-')) r.edit({name: r.name.replace('USER-','')});
		});

		msg.channel.createMessage('Roles cleaned!')
	},
	alias: ['cu', 'clean']
}