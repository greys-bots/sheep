module.exports = {
	help: ()=> "Gets or creates an API token for your account",
	usage: ()=> [" - Views/creates your account's API token",
				 " refresh - Resets your token, in the case of a breach of data"],
	execute: async (bot, msg, args) => {
		var token = await bot.stores.tokens.get(msg.author.id);
		if(!token) token = await bot.stores.tokens.create(msg.author.id, [...Array(32)].map(i=>(~~(Math.random()*36)).toString(36)).join(''));

		if(msg.channel.guild) await msg.channel.send("Token sent!");
		await msg.author.send("Here's your token!");
		await msg.author.send(token.token);
		return;
	},
	subcommands: {}
}

module.exports.subcommands.refresh = {
	help: ()=> "Creates a new token for your account",
	usage: ()=> [" - Resets your account's API token, in case it gets leaked"],
	execute: async (bot, msg, args) => {
		var token = await bot.stores.tokens.get(msg.author.id);
		if(!token) token = await bot.stores.tokens.create(msg.author.id, [...Array(32)].map(i=>(~~(Math.random()*36)).toString(36)).join(''));
		else token = await bot.stores.tokens.update(msg.author.id, [...Array(32)].map(i=>(~~(Math.random()*36)).toString(36)).join(''));

		if(msg.channel.guild) await msg.channel.send("New token sent!");
		await msg.author.send("Here's your new token!");
		await msg.author.send(token.token);
		return;
	}
}