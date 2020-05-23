const ipc = require('node-ipc');

ipc.config.id = 'sheep-site';
ipc.config.silent = true;
ipc.config.sync = true;

ipc.data = {};

ipc.connectTo('sheep-bot', function() {
	ipc.of['sheep-bot'].on('STATS', function(msg) {
		console.log('stats received!');
		ipc.data.stats = msg;
	})

	ipc.of['sheep-bot'].on('COMMANDS', function(msg) {
		console.log('commands received!');
		ipc.data.commands = msg.cmds;
		ipc.data.modules = msg.mods;
	})
})

module.exports = () => {
	ipc.of['sheep-bot'].emit('STATS');
	setInterval(()=> ipc.of['sheep-bot'].emit('STATS'), 1000 * 60 * 10);

	ipc.of['sheep-bot'].emit('COMMANDS');
	setInterval(()=> ipc.of['sheep-bot'].emit('COMMANDS'), 1000 * 60 * 10);

	return ipc;
}