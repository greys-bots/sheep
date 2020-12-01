const { ShardingManager } 	= require('discord.js');
const manager 				= new ShardingManager(__dirname + '/bot.js', {token: process.env.TOKEN});

var shardCount = process.env.SHARDCOUNT ? parseInt(process.env.SHARDCOUNT) : undefined;

manager.spawn(shardCount);
manager.on('shardCreate', shard => {
    shard.on('message', (msg)=> {
    	manager.emit('message', shard, msg)
    });
    console.log(`Launched shard ${shard.id}`);
    if(shard.id == manager.totalShards - 1) {
        console.log('all shards launched');
    }
});

module.exports = async () => {

	manager.db = await require(__dirname + '/../../common/stores/__db')(manager);

	manager.getStats = async function() {
		var guilds = (await manager.broadcastEval(`this.guilds.cache.size`)).reduce((prev, val) => prev + val, 0);
		var users = (await manager.broadcastEval(`this.users.cache.size`)).reduce((prev, val) => prev + val, 0);

		return Promise.resolve({guilds, users});
	}

	manager.getGuild = async function(guild, user) {
		var guild = (await manager.broadcastEval(`
			(async () => {
				var guild = this.guilds.cache.find(g => g.id == ${guild});
				if(!guild) return undefined;

				return {
					id: guild.id,
					members: guild.members.cache.map(m => {
						return {
							id: m.id,
							name: m.user.username,
							discriminator: m.user.discriminator,
							avatarURL: m.user.avatarURL({format: 'png'})
						}
					}),
					${user ? `permissions: guild.members.cache.find(u => u.id == ${user})?.permissions.toArray()` : ''}
				};
			})();
				
		`)).filter(x => x)[0];

		guild.extras = {};
		var config = await manager.stores.configs.get(guild.id)
		if(config) guild.extras.config = config;

		var usages = await manager.stores.usages.get(guild.id)
		if(usages) guild.extras.usages = usages;

		var serverRoles = await manager.stores.serverRoles.getAllRaw(guild.id)
		if(serverRoles) guild.extras.serverRoles = serverRoles;

		var userRoles = await manager.stores.userRoles.getAllRaw(guild.id)
		if(userRoles) guild.extras.userRoles = userRoles;

		return Promise.resolve(guild);
	}

	manager.getGuilds = async function() {
		var data = (await manager.broadcastEval(`
			(async () => {
				var guilds = this.guilds.cache.map(g => Object.assign({}, g));

				return guilds;
			})();
				
		`));
		var guilds = [];
		for(var cluster of data) {
			guilds = guilds.concat([...cluster]);
		}

		for(var i = 0; i < guilds.length; i++) {
			guilds[i].extras = {};
			var config = await manager.stores.configs.get(guilds[i].id)
			if(config) {
				guilds[i].extras.config = config;
			}

			var usages = await manager.stores.usages.get(guilds[i].id)
			if(usages) guilds[i].extras.usages = usages;

			var serverRoles = await manager.stores.serverRoles.getAllRaw(guilds[i].id)
			if(serverRoles) guilds[i].extras.serverRoles = serverRoles;

			var userRoles = await manager.stores.userRoles.getAllRaw(guilds[i].id)
			if(userRoles) guilds[i].extras.userRoles = userRoles;
		}

		return Promise.resolve(guilds);
	}

	manager.getUser = async function(user) {
		var user = (await manager.broadcastEval(`
			(async () => {
				var user = this.users.cache.find(u => u.id == ${user});

				return user;
			})();
		`)).filter(x => x)[0];

		var colors = await manager.stores.colors.getAll(user.id);
		if(colors) user.colors = colors.sort((a, b) => {
			return (a.name.toLowerCase() > b.name.toLowerCase() ? 1 :
				   a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 0);
		});
		
		return Promise.resolve(user);
	}

	manager.getUsers = async function() {
		var data = (await manager.broadcastEval(`
			(async () => {
				var users = this.users.cache.map(u => u);

				return users;
			})();
		`));
		var users = [];
		for(var cluster of data) users = users.concat([...cluster]);

		for(var user of users) {
			var colors = await manager.stores.colors.getAll(user.id);
			if(colors) user.colors = colors.sort((a, b) => {
				return (a.name.toLowerCase() > b.name.toLowerCase() ? 1 :
					   a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 0);
			});
		}
		
		return Promise.resolve(users);
	}

	manager.getRole = async function(guild, role) {
		var data = (await manager.broadcastEval(`
			(async ()=> {
				var guild = this.guilds.resolve(${guild});
				if(!guild) return null;
				var role = guild.roles.fetch(${role});
				return role;
			})();
		`)).filter(x => x)[0];

		return Promise.resolve(data);
	}

	manager.getRoles = async function(guild, roles) {
		var data = (await manager.broadcastEval(`
			(async () => {
				var guild = this.guilds.resolve(${guild});
				if(!guild) return null;
				var roles = [];
				for(var rl of [${roles.toString()}]) {
					var role = guild.roles.fetch(rl);
					roles.push(role);
				}
				return roles;
			})();
		`)).filter(x => x)[0];

		return Promise.resolve(data);
	}

	manager.editRole = async function(user, guild, role, data = {}) {
		var guild = (await manager.broadcastEval(`this.guilds.cache.find(g => g.id == ${msg.guild})`)).filter(g => g)[0];
		if(!guild) return 
		var rl = guild.roles.find(r => r == role);
		if(!rl) return Promise.reject({message: 'Invalid role.'});

		//make sure this is a role we manage
		var managed = await manager.stores.serverRoles.getRaw(guild.id, rl);
		if(!managed) managed = await manager.stores.userRoles.getRaw(guild.id, msg.user);
		if(!managed) return Promise.reject({message: 'Invalid role.'});
		//if it's a user role: make sure it's the same one we're trying to edit
		if(managed.user_id && managed.role_id != rl) return Promise.reject({message: 'Invalid role.'});

		try {
			rl = (await manager.broadcastEval(`
				(async (data) => {
					var guild = this.guilds.cache.find(g => g.id == ${guild.id});
					if(!guild) return null;
					var role = guild.roles.cache.find(r => r.id == ${rl});
					if(!${managed.user_id}) {
						var member = guild.members.cache.find(m => m.id == ${msg.user});
						if(!member.permissions.has('MANAGE_ROLES')) return {err: 'User missing permissions.'};
					}

					role = await role.edit(data);

					return role;
				})(${JSON.stringify(data)})
			`)).filter(r => r)[0];
		} catch(e) {
			console.log(e);
			return Promise.reject({message: e.message});
		}

		if(rl.err) return Promise.reject({message: rl.err});
		else return Promise.resolve(rl);
	}

	manager.deleteRole = async function(user, guild, role) {
		var guild = (await manager.broadcastEval(`this.guilds.cache.find(g => g.id == ${msg.guild})`)).filter(g => g)[0];
		if(!guild) return 
		var rl = guild.roles.find(r => r == role);
		if(!rl) return Promise.reject({message: 'Invalid role.'});

		//make sure this is a role we manage
		var managed = await manager.stores.serverRoles.getRaw(guild.id, rl);
		if(!managed) managed = await manager.stores.userRoles.getRaw(guild.id, msg.user);
		if(!managed) return Promise.reject.reject({message: 'Invalid role.'});
		//if it's a user role: make sure it's the same one we're trying to edit
		if(managed.user_id && managed.role_id != rl) return Promise.reject.reject({message: 'Invalid role.'});

		try {
			await manager.broadcastEval(`
				(async () => {
					var guild = this.guilds.cache.find(g => g.id == ${guild.id});
					if(!guild) return null;
					var role = guild.roles.cache.find(r => r.id == ${role});
					if(!${managed.user_id}) {
						var member = guild.members.cache.find(m => m.id == ${msg.user});
						if(!member.permissions.has('MANAGE_ROLES')) return {err: 'User missing permissions.'};
					}

					await role.delete('Deleted through Sheep web dashboard');
				})()
			`);

			if(managed.user_id) await manager.stores.userRoles.delete(guild.id, user.id);
			else await manager.stores.serverRoles.delete(guild.id, rl);
		} catch(e) {
			console.log(e);
			return Promise.reject({message: e.message || e});
		}

		return Promise.resolve();
	}

	return Promise.resolve(manager);
}