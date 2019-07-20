module.exports = {
	help: ()=> "Cleans up Hex roles and makes them compatible with Sheep",
	usage: ()=> [" - Removes the `USER-` prefix on roles created by Hex to make the compatible with this bot"],
	desc: ()=> "NOTE: this role requires the `manageRoles` permission from the user. This effectively makes it moderator-only",
	execute: async (bot, msg, args)=> {
		if(!msg.member.permission.has('manageRoles')) return 'You do not have permission to use this command :(';

		var err = false;
		await Promise.all(msg.guild.roles.map(r => {
			return new Promise(async res => {
				if(r.name.startsWith('USER-')) {
					try {
						await r.edit({name: r.name.replace('USER-','')})
						res('');
					} catch(e) {
						err = true;
						res('');
					}
				} else {
					res('')
				}
			})
		}))

		return err ? 'Some roles could not be cleaned because they are above my highest role :(' : 'Roles cleaned!'
	},
	alias: ['cu', 'clean']
}