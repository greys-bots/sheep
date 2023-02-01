require('dotenv').config();

const { ShardingManager } = require('discord.js');
const manager = new ShardingManager('./bot.js', { token: process.env.TOKEN });

manager.spawn({
	timeout: -1
});
manager.on('shardCreate', shard => {
    console.log(`Launched shard ${shard.id}`);
});

process.on(`SIGTERM`, ()=> {
    console.log("Ending connections...");
    process.exit();
})

//for ctrl+c-ing
process.on(`SIGINT`, ()=> {
    console.log("Ending connections...");
    process.exit();
})
