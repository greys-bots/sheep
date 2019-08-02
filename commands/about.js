module.exports = {
	help: ()=> "A little about the bot",
	usage: ()=> [" - Just what's on the tin"],
	execute: async (bot, msg, args) => {
		return ({embed: {
			title: '**About**',
			fields:[
				{name: "Prefixes", value: "s!, sh!, sheep!, or baa!"},
				{name: "Invite", value: "https://discordapp.com/api/oauth2/authorize?client_id=585271178180952064&permissions=268462080&scope=bot"},
				{name: "Creator", value: "greysdawn (GreySkies#9950)"},
				{name: "Repo", value: "https://github.com/greys-bots/sheep"},
				{name: "Website", value: "https://sheep.greysdawn.com/\n`NOTE: Domain has been changed from .tk to .com!`"},
				{name: "Support Discord", value: "https://discord.gg/EvDmXGt"},
				{name: "Creator's Patreon", value: "https://patreon.com/greysdawn"},
				{name: "Creator's Ko-Fi", value: "https://ko-fi.com/greysdawn"},
				{name: "Guilds", value: bot.guilds.size},
				{name: "Users", value: bot.users.size}
			]
		}})
	},
	alias: ['abt', 'a']
}