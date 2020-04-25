require('dotenv').config();

const { ShardingManager } = require('discord.js');
const manager = new ShardingManager('./bot.js', { token: process.env.TOKEN });
var pgIPC = require('pg-ipc');
var client = new (require('pg')).Client();

var ipc = pgIPC(client)
 
ipc.on('error', console.error)

ipc.on('end', ()=> client.end());
 
ipc.on('sheepIPC', async function (msg) {
  // Ignore messages from this process
  if(msg.processId === client.processID) return;
  if(!msg.type) return;

  switch(msg.type) {
  	case "STATS":
  		var guilds = (await manager.broadcastEval(`this.guilds.cache.size`)).reduce((prev, val) => prev + val, 0);
  		var users = (await manager.broadcastEval(`this.users.cache.size`)).reduce((prev, val) => prev + val, 0);
  		ipc.notify(`sheepIPC`, {guilds, users});
  		break;
  }
})

manager.spawn();
manager.on('shardCreate', shard => console.log(`Launched shard ${shard.id}`));

manager.broadcastEval(`this.guilds.cache.size`).then(result => {
	console.log("Total guilds: "+result.reduce((prev, val) => prev + val, 0));
}).catch(e => console.log(e.message));

process.on(`SIGTERM`, ()=> {
  console.log("Ending connections...");
  try {
    ipc.end();
  } catch(e) {
    console.log(e.message);
  }
  process.exit();
})

//for ctrl+c-ing
process.on(`SIGINT`, ()=> {
  console.log("Ending connections...");
  try {
    ipc.end();
  } catch(e) {
    console.log(e.message);
  }
  process.exit();
})