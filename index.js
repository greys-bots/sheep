require('dotenv').config();

const { ShardingManager } = require('discord.js');
const manager = new ShardingManager('./bot.js', { token: process.env.TOKEN });
const ipc       = require('node-ipc');
const handlers = {
    command: require('./handlers/command'),
    interaction: require('./handlers/interaction')
}

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
            return {cmds, mods};
        }))[0];
        ipc.server.emit(socket, `COMMANDS`, commands);
    })
});

ipc.server.start();

// manager.spawn({
// 	timeout: -1
// });
// manager.on('shardCreate', async shard => {
//     console.log(`Launched shard ${shard.id}`);
// });

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

async function setup() {
    const cmds = await handlers.command.load(__dirname + '/commands');
    const acmds = await handlers.interaction.load(__dirname + '/slashcommands');

    manager.on('shardCreate', shard => console.log(`Launched shard ${shard.id}`));
    var shards = await manager.spawn({
        timeout: -1
    })

    shards.forEach(async shard => {
        console.log(cmds)
        try {
            shard.eval(function(client, { cmds, acmds }) {
                console.log('Setting up commands for shard ' + shard.id);
                for(var k in cmds) {
                    client[k] = cmds[k]
                }

                client.slashCommands = acmds.slashCommands;
                if(shard.id == 0) 
                    handlers.interaction.sendCommands(c, acmds);

                client.handlers = {
                    command: new handlers.command.handler(c),
                    interaction: new handlers.interaction.handler(c)
                };
            }, { cmds, acmds });
            var test = await shard.fetchClientValue('commands');
            console.log(test)
        } catch(e) {
            console.log(e);
        }
    })

    // manager.on('shardCreate', async shard => {
    //     console.log(`Launched shard ${shard.id}`);
    //     shard.on('ready', async () => {
    //         console.log(`Shard ${shard.id} ready`)
        
    //     })
    // })
}

setup()