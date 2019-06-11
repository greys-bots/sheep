module.exports = {
	help: ()=> "A little about the bot",
	usage: ()=> [" - Just what's on the tin"],
	execute: async (bot, msg, args) => {
		msg.channel.createMessage([
			'**About**',
			"```",
			"Creator: greysdawn (GreySkies#9950)",
			"Repo: https://github.com/greys-bots/sheep",
			"Creator's Patreon: https://patreon.com/greysdawn",
			"Guilds: "+bot.guilds.size,
			"Users: "+bot.users.size,
			"```"
			].join("\n"));
	},
	alias: ['abt', 'a']
}