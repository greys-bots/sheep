require('dotenv').config();

const { ShardingManager }   = require('discord.js');
const manager               = new ShardingManager(__dirname + '/bot.js', { token: process.env.TOKEN });
const rawIPC                = require('node-ipc').IPC;

(async () => {
    manager.db = await require(__dirname + '/../common/stores/__db')(manager);
})()

const ipc = new rawIPC();
ipc.config.id = 'sheep-bot';
ipc.config.silent = true;
ipc.config.sync = true;

ipc.serve(function() {

    ipc.server.on('error', console.error);

    ipc.server.on('STATS', async function (msg, socket) {
        console.log("stats requested");
        var guilds = (await manager.broadcastEval(`this.guilds.cache.size`)).reduce((prev, val) => prev + val, 0);
        var users = (await manager.broadcastEval(`this.users.cache.size`)).reduce((prev, val) => prev + val, 0);
        ipc.server.emit(socket, `STATS`, {guilds, users});
    });

    ipc.server.on('GUILDS', async function (msg, socket) {
        console.log("guilds requested");
        var data = (await manager.broadcastEval(`
            (async () => {
                var guilds = this.guilds.cache.map(g => Object.assign({}, g));
                for(var i = 0; i < guilds.length; i++) {
                    guilds[i].extras = {};
                    var config = await this.stores.configs.get(guilds[i].id)
                    if(config) {
                        guilds[i].extras.config = config;
                    }

                    var usages = await this.stores.usages.get(guilds[i].id)
                    if(usages) guilds[i].extras.usages = usages;

                    var serverRoles = await this.stores.serverRoles.getAll(guilds[i].id)
                    if(serverRoles) guilds[i].extras.serverRoles = serverRoles;

                    var userRoles = await this.stores.userRoles.getAll(guilds[i].id)
                    if(userRoles) guilds[i].extras.userRoles = userRoles;

                }

                return guilds;
            })();
                
        `));
        var guilds = [];
        for(var cluster of data) {
            guilds = guilds.concat([...cluster]);
        }
        console.log(guilds.filter(g => g.extras && g.extras.config).map(g => g.name));
        ipc.server.emit(socket, `GUILDS`, {guilds});
    });

    ipc.server.on('USERS', async function (msg, socket) {
        console.log("users requested");
        var data = (await manager.broadcastEval(`
            (async () => {
                var users = this.users.cache.map(u => u);
                for(var i = 0; i < users.length; i++) {
                    var colors = await this.stores.colors.getAll(users[i].id);
                    if(colors) users[i].colors = colors;
                }

                return users;
            })();
        `));
        var users = [];
        for(var cluster of data) users = users.concat([...cluster]);
        ipc.server.emit(socket, `USERS`, {users});
    });

    ipc.server.on('COMMANDS', async function (msg, socket) {
        console.log("commands requested");
        var commands = (await manager.broadcastEval(`
            var cmds = this.commands.map(c => {
                return {
                    name: c.name,
                    help: c.help(),
                    usage: c.usage().map(u => 's!' + c.name + u),
                    desc: c.desc ? c.desc() : null,
                    alias: c.alias,
                    guildOnly: c.guildOnly,
                    permissions: c.permissions,
                    subcommands: c.subcommands ? c.subcommands.map(sc => {
                        return {
                            name: sc.name,
                            help: sc.help(),
                            usage: sc.usage().map(u => 's!' + sc.name + u),
                            desc: sc.desc ? sc.desc() : null,
                            alias: sc.alias,
                            guildOnly: sc.guildOnly,
                            permissions: sc.permissions
                        }
                    }) : null
                }
            });

            var mods = this.modules.map(m => {
                return {
                    name: m.name,
                    color: m.color,
                    description: m.description,
                    alias: m.alias,
                    commands: m.commands.map(c => c.name)
                }
            })

            cmds.forEach((c, i) => cmds[i].module = mods.find(m => m.commands.includes(c.name)));
            ({cmds, mods})
        `))[0];
        ipc.server.emit(socket, `COMMANDS`, commands);
    })

    ipc.server.on('ROLE', async function (msg, socket) {
        console.log(msg);
        if(!msg.type) return;

        var guild = (await manager.broadcastEval(`this.guilds.cache.find(g => g.id == ${msg.guild})`)).filter(g => g)[0];
        if(!guild) return ipc.server.emit(socket, 'ROLE', {success: false, err: 'Invalid guild.'});;
        var role = guild.roles.find(r => r == msg.role);
        if(!role) return ipc.server.emit(socket, 'ROLE', {success: false, err: 'Invalid role.'});;

        //make sure this is a role we manage
        var managed = await manager.stores.serverRoles.getRaw(guild.id, role);
        if(!managed) managed = await manager.stores.userRoles.getRaw(guild.id, msg.user);
        if(!managed) return ipc.server.emit(socket, 'ROLE', {success: false, err: 'Invalid role.'});
        //if it's a user role: make sure it's the same one we're trying to edit
        if(managed.user_id && managed.role_id != role) return ipc.server.emit(socket, 'ROLE', {success: false, err: 'Invalid role.'});

        switch(msg.type) {
            case 'update':
                try {
                    role = (await manager.broadcastEval(`
                        (async (data) => {
                            var guild = this.guilds.cache.find(g => g.id == ${guild.id});
                            if(!guild) return null;
                            var role = guild.roles.cache.find(r => r.id == ${role});
                            if(!${managed.user_id}) {
                                var member = guild.members.cache.find(m => m.id == ${msg.user});
                                if(!member.permissions.has('MANAGE_MESSAGES')) return {err: 'User missing permissions.'};
                            }

                            role = await role.edit(data);

                            return role;
                        })(${JSON.stringify(msg.data)})
                    `)).filter(r => r)[0];
                } catch(e) {
                    console.log(e);
                    ipc.server.emit(socket, 'ROLE', {success: false, err: e.message});
                    return;
                }

                if(role.err) ipc.server.emit(socket, 'ROLE', {success: false, err: role.err});
                else ipc.server.emit(socket, 'ROLE', {success: true, role});
                break;
            case 'delete':
                try {
                    await manager.broadcastEval(`
                        (async () => {
                            var guild = this.guilds.cache.find(g => g.id == ${guild.id});
                            if(!guild) return null;
                            var role = guild.roles.cache.find(r => r.id == ${role});

                            await role.delete('Deleted through web request');
                        })()
                    `);
                } catch(e) {
                    console.log(e);
                    ipc.server.emit(socket, 'ROLE', {success: false});
                }

                ipc.server.emit(socket, 'ROLE', {success: true});
                break;
        }
    });
});

ipc.server.start();
console.log('ipc server started');

const shardCount = 2;

manager.spawn(shardCount);
manager.on('shardCreate', shard => {
    shard.on('message', (msg)=> manager.emit('message', shard, msg))
    console.log(`Launched shard ${shard.id}`);
    if(shard.id == shardCount - 1) {
        console.log('all shards launched');
    }
});

manager.on('message', (shard, msg) => {
    if(msg == "READY" && shard.id == shardCount - 1) {
        ipc.server.broadcast('READY');
        manager.broadcastEval('this.updateStatus()');
    }
})

module.exports = { manager, ipc }