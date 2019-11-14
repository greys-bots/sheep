module.exports = {
	help: ()=> "A little about the bot",
	usage: ()=> [" - Just what's on the tin"],
	execute: async (bot, msg, args) => {
		return ({embed: {
			title: '**About**',
			description: "Baa! I'm Sheep! I help people change their name color here on Discord.\nMy prefixes are `s!`, `sh!`, `sheep!`, and `baa!`",
			fields:[
				{name: "Creators", value: "[greysdawn](https://github.com/greysdawn) | GreySkies#9950"},
				{name: "Invite", value: "[Clicky!](https://discordapp.com/api/oauth2/authorize?client_id=585271178180952064&permissions=268462080&scope=bot)",inline: true},
				{name: "Support Server", value: "[Clicky!](https://discord.gg/EvDmXGt)", inline: true},
				{name: "Other Links", value: "[Repo](https://github.com/greys-bots/sheep) | [Website](https://sheep.greysdawn.com/)"},
				{name: "Stats", value: `Guilds: ${bot.guilds.size} | Users: ${bot.users.size}`},
				{name: "Support my creators!", value: "[Ko-Fi](https://ko-fi.com/greysdawn) | [Patreon](https://patreon.com/greysdawn)"}
			]
		}})
	},
	alias: ['abt', 'a']
}