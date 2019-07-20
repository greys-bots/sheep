module.exports = {
	help: ()=> "Change your color",
	usage: ()=> [" [color] - Change your color to the one given"],
	desc: ()=> "Colors can be hex codes or color names! Full list of names found [here](https://www.w3schools.com/colors/colors_names.asp)\nNote: Roles above the automatically-created Sheep role MUST be uncolored, or this won't work!",
	execute: async (bot, msg, args)=> {
		var color;
		if(!args[0]) color = bot.tc(Math.floor(Math.random()*16777215).toString(16))
		else color = bot.tc(args.join(''));
		if(!color.isValid()) return msg.channel.createMessage('That is not a valid color :(');
		var crgb = color.toRgb();
		var text = (crgb.r * 0.299) + (crgb.g * 0.587) + (crgb.b * 0.114) > 186 ? '000000' : 'ffffff';
		await msg.channel.createMessage({embed: {
			title: "Color "+color.toHexString().toUpperCase(),
			image: {
				url: `https://sheep.greysdawn.tk/sheep/${color.toHex()}`
			},
			color: parseInt(color.toHex(), 16)
		}}).then(message => {
			if(!bot.posts) bot.posts = {};
			bot.posts[message.id] = {
				user: msg.author.id,
				data: color,
				timeout: setTimeout(()=> {
					if(!bot.posts[message.id]) return;
					message.removeReactions()
					delete bot.posts[message.id];
				}, 900000)
			};
			message.addReaction("\u2705");
			message.addReaction("\u274C");
			message.addReaction("🔀");
			return;
		}).catch(e => {
			console.log(e);
			return ('Baa! There was an error D:');
		});
	},
	alias: ['c', 'cl', 'colour', 'ch']
}