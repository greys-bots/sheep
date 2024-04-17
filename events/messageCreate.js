const WELCOMES = [
	"you're welcome!",
	"you're welcome! :D",
	"of course!",
	"no problem!",
	"don't mention it :heart:",
	"baa!! :heart:"
];

module.exports = async (msg, bot)=>{
	if(msg.author.bot) return;
	var prefix = new RegExp(`^<@!?(?:${bot.user.id})>`);
	if(!msg.content.match(prefix)) return;

	var thanks = msg.content.replace(prefix, "").trim().match(/^(thanks? ?(you)?|ty),? ?(?:sheep)?/i);
	if(thanks) return await msg.channel.send(WELCOMES[Math.floor(Math.random() * WELCOMES.length)]);

	var baa = msg.content.replace(prefix, "").trim().match(/^b(a{1,})/i);
	if(baa) return await msg.channel.send('Baaa!')
	
	return await msg.channel.send("Please use my slash commands! Check out this post for more info: https://www.patreon.com/posts/your-guide-to-to-77199320")
}