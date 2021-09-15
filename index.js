require('dotenv').config();

const { ShardingManager } = require('discord.js');
const manager = new ShardingManager('./bot.js', { token: process.env.TOKEN });
const ipc       = require('node-ipc');

ipc.config.id = 'sheep-bot';
ipc.config.silent = 'true';

ipc.serve(function() {

    ipc.server.on('error', console.error);

    ipc.server.on('STATS', async function (msg, socket) {
        console.log("stats requested");
        var guilds = (await manager.broadcastEval(cli => cli.guilds.cache.size)).reduce((prev, val) => prev + val, 0);
        var users = (await manager.broadcastEval(cli => cli.users.cache.size)).reduce((prev, val) => prev + val, 0);
        ipc.server.emit(socket, `STATS`, {guilds, users});
    })

    ipc.server.on('COMMANDS', async function (msg, socket) {
        console.log("commands requested");
        var commands = (await manager.broadcastEval(cli => {
        	var cmds = cli.commands.map(c => {
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

            var mods = cli.modules.map(m => {
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
        }))[0];
        ipc.server.emit(socket, `COMMANDS`, commands);
    })
});

ipc.server.start();

manager.spawn();
manager.on('shardCreate', shard => {
    console.log(`Launched shard ${shard.id}`);
});

process.on(`SIGTERM`, ()=> {
    console.log("Ending connections...");
    try {
        ipc.server.stop();
    } catch(e) {
        console.log(e.message);
    }
    process.exit();
})

//for ctrl+c-ing
process.on(`SIGINT`, ()=> {
    console.log("Ending connections...");
    try {
        ipc.server.stop();
    } catch(e) {
        console.log(e.message);
    }
    process.exit();
})
