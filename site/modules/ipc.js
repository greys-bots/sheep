const rawIPC = require('node-ipc').IPC;
const ipc = new rawIPC();

ipc.config.id = 'sheep-site';
ipc.config.silent = true;
ipc.config.sync = true;

ipc.data = {};

ipc.connectTo('sheep-bot', function() {

	ipc.of['sheep-bot'].on('READY', () => {
		console.log('connected! emitting data getters...');
		ipc.of['sheep-bot'].emit('STATS');
		setInterval(()=> ipc.of['sheep-bot'].emit('STATS'), 1000 * 60 * 10);

		ipc.of['sheep-bot'].emit('COMMANDS');
		setInterval(()=> ipc.of['sheep-bot'].emit('COMMANDS'), 1000 * 60 * 10);

		ipc.of['sheep-bot'].emit('GUILDS');
		setInterval(()=> ipc.of['sheep-bot'].emit('GUILDS'), 1000 * 60 * 10);

		ipc.of['sheep-bot'].emit('USERS');
		setInterval(()=> ipc.of['sheep-bot'].emit('USERS'), 1000 * 60 * 10);
	})

	ipc.of['sheep-bot'].on('STATS', function(msg) {
		console.log('stats received!');
		ipc.data.stats = msg;
	})

	ipc.of['sheep-bot'].on('COMMANDS', function(msg) {
		console.log('commands received!');
		ipc.data.commands = msg.cmds;
		msg.mods.forEach(m => {
			m.commands = msg.cmds.filter(x => m.commands.includes(x.name));
		})

		ipc.data.modules = msg.mods;
	})

	ipc.of['sheep-bot'].on('GUILDS', function(msg) {
		console.log(msg.guilds.length);
		ipc.data.guilds = msg.guilds;
		console.log('guilds received!');
	})

	ipc.of['sheep-bot'].on('USERS', function(msg) {
		console.log(msg.users.length);
		ipc.data.users = msg.users;
		console.log('users received!');
	})
})

module.exports = () => {
	return ipc;
}