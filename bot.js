const Eris 		= require("eris-additions")(require("eris"));
// const mysql 	= require("mysql");
const fs 		= require("fs");

require ('dotenv').config();

const bot = new Eris(process.env.TOKEN);

bot.commands = {};

bot.prefix = ["s!","sh!","sheep!","baa!"]

bot.utils = require('./utils');

bot.tc = require('tinycolor2');
bot.jimp = require('jimp');

bot.commands.help = {
	help: ()=> "Displays help embed.",
	usage: ()=> [" - Displays help for all commands.",
				" [command] - Displays help for specfic command.",
				" [command] [subcommand]... - Displays help for a command's subcommands"],
	execute: async (bot, msg, args) => {
		let cmd;
		let names;
		let embed;
		if(args[0]) {
			let dat = await bot.parseCommand(bot, msg, args);
			if(dat) {
				cmd = dat[0];
				names = dat[2].split(" ");
				embed = {
					title: `Help | ${names.join(" - ").toLowerCase()}`,
					description: [
						`${cmd.help()}\n\n`,
						`**Usage**\n${cmd.usage().map(c => `${bot.prefix[0] + names.join(" ")}${c}`).join("\n")}\n\n`,
						`**Aliases:** ${cmd.alias ? cmd.alias.join(", ") : "(none)"}\n\n`,
						`**Subcommands**\n${cmd.subcommands ?
							Object.keys(cmd.subcommands).map(sc => `**${bot.prefix[0]}${names.join(" ")} ${sc}** - ${cmd.subcommands[sc].help()}`).join("\n") +"\n\n" : 
							"(none)\n\n"}`,
							cmd.desc() ? "**Extra**\n"+cmd.desc() : ""
					].join(""),
					footer: {
						icon_url: bot.user.avatarURL,
						text: "Arguments like [this] are required, arguments like <this> are optional."
					}
				}
			} else {
				msg.channel.createMessage("Command not found.")
			}
		} else {
			embed = {
				title: `Colorbot - help`,
				description:
					`Hello, I am a sheep baaaah-t! I'll help you change your colors!\n**My current prefixes are:** ${bot.prefix.join(", ")}\n\n`+
					`**Commands**\n${Object.keys(bot.commands)
									.map(c => `**${bot.prefix[0] + c}** - ${bot.commands[c].help()}`)
									.join("\n")}\n\n`,
				footer: {
					icon_url: bot.user.avatarURL,
					text: "Arguments like [this] are required, arguments like <this> are optional."
				}
			}
		}

		msg.channel.createMessage({embed: embed});
	},
	alias: ["h", "halp", "?"]
}

async function setup() {
	var files = fs.readdirSync("./commands");
	await Promise.all(files.map(f => {
		bot.commands[f.slice(0,-3)] = require("./commands/"+f);
		return new Promise((res,rej)=>{
			setTimeout(res("a"),100)
		})
	})).then(()=> console.log("finished loading commands."));
}

bot.parseCommand = async function(bot, msg, args, command) {
	return new Promise(async (res,rej)=>{
		var commands;
		var cmd;
		var name = "";
		if(command) {
			commands = command.subcommands || [];
		} else {
			commands = bot.commands;
		}

		if(args[0] && commands[args[0].toLowerCase()]) {
			cmd = commands[args[0].toLowerCase()];
			name = args[0].toLowerCase();
			args = args.slice(1);
		} else if(args[0] && Object.values(commands).find(cm => cm.alias && cm.alias.includes(args[0].toLowerCase()))) {
			cmd = Object.values(commands).find(cm => cm.alias && cm.alias.includes(args[0].toLowerCase()));
			name = args[0].toLowerCase();
			args = args.slice(1);
		} else if(!cmd) {
			res(undefined);
		}

		if(cmd && cmd.subcommands && args[0]) {
			let data = await bot.parseCommand(bot, msg, args, cmd);
			if(data) {
				cmd = data[0]; args = data[1];
				name += " "+data[2];
			}
		}

		res([cmd, args, name]);
	})
	
}

bot.on("messageCreate",async (msg)=>{
	if(msg.author.bot) return;
	if(!new RegExp(`^(${bot.prefix.join("|")})`,"i").test(msg.content.toLowerCase())) return;
	let args = msg.content.replace(new RegExp(`^(${bot.prefix.join("|")})`,"i"), "").split(" ");
	let cmd = await bot.parseCommand(bot, msg, args);
	if(cmd) {
		console.log(cmd)
		var check = await bot.utils.checkPermissions(bot, msg, cmd);
		if(check) cmd[0].execute(bot, msg, cmd[1]);
		else msg.channel.createMessage('You do not have permission to use that command.');
	}
	else msg.channel.createMessage("Command not found.");
});

bot.on("messageReactionAdd", async (msg, emoji, user)=> {
	if(bot.user.id == user) return;
	if(bot.posts && bot.posts[msg.id] && bot.posts[msg.id].user == user) {
		if(emoji.name == "\u2705") {
			var position = msg.guild.roles.find(r => msg.guild.members.find(m => m.id == bot.user.id).roles.find(rl => rl == r.id && r.managed)).position;
			var role;
			var color = bot.posts[msg.id].data.toHex() == "000000" ? "000001" : bot.posts[msg.id].data.toHex();
			role = msg.channel.guild.roles.find(r => r.name == user);
			if(!role) role = await bot.createRole(msg.channel.guild.id, {name: user, color: parseInt(color,16)});
			else role = await bot.editRole(msg.channel.guild.id, role.id, {color: parseInt(color, 16)});
			bot.addGuildMemberRole(msg.channel.guild.id, user, role.id);
			bot.editRolePosition(msg.channel.guild.id, role.id, position-1);
			bot.editMessage(msg.channel.id, msg.id, {content: "Color successfully changed to #"+color+"! :D", embed: {}});
			bot.removeMessageReactions(msg.channel.id, msg.id);
			delete bot.posts[msg.id];
		} else if(emoji.name == "\u274C") {
			bot.editMessage(msg.channel.id, msg.id, {content: "Action cancelled", embed: {}});
			bot.removeMessageReactions(msg.channel.id, msg.id);
			delete bot.posts[msg.id];
		}
	}
})

bot.on("guildMemberRemove", async (guild, member)=> {
	var role = guild.roles.find(r => r.name == member.id);
	if(!role) return;
	bot.deleteRole(guild.id, role.id, "Member left server");
})

setup();
bot.connect()
.catch(e => console.log("Trouble connecting...\n"+e));