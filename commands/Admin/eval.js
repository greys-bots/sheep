module.exports = {
	help: ()=>"Evaluate JavaScript code",
	usage: ()=>[" [code] - Evaluates given code"],
	desc: ()=>"Only the bot owner can use this command",
	execute: async (bot, msg, args)=>{
		if(msg.author.id != bot.owner) return "Only the bot owner can use this command";
		try {
			const toeval = args.join(" ");
			let evld = await eval(toeval);

			if(typeof(evld) !== "string") evld = require("util").inspect(evld);

			return bot.utils.cleanText(evld);
		} catch (err) {
			if(err) console.log(err);
		}
	}
}