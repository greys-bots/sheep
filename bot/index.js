require('dotenv').config();

const { ShardingManager }   = require('discord.js');
const manager               = new ShardingManager(__dirname + '/bot.js', { token: process.env.TOKEN });

var shardCount = process.env.SHARDCOUNT ? parseInt(process.env.SHARDCOUNT) : null;

manager.spawn(shardCount);
manager.on('shardCreate', shard => {
    shard.on('message', (msg)=> manager.emit('message', shard, msg))
    console.log(`Launched shard ${shard.id}`);
    if(shard.id == manager.totalShards - 1) {
        console.log('all shards launched');
    }
});

manager.on('message', (shard, msg) => {
    if(msg == "READY" && shard.id == shardCount - 1) {
        manager.broadcastEval('this.updateStatus()');
    }
})

module.exports = {manager};