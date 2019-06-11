module.exports = {
	help: ()=> "Change your color",
	usage: ()=> [" [color] - Change your color to the one given"],
	desc: ()=> "Colors can be hex codes or color names! Full list of names found [here](https://www.w3schools.com/colors/colors_names.asp)\nNote: Roles above the automatically-created Sheep role MUST be uncolored, or this won't work!",
	execute: async (bot, msg, args)=> {
		if(!args[0]) return msg.channel.createMessage('Please provide a color :(');
		var color = bot.tc(args[0]);
		if(!color.isValid()) return msg.channel.createMessage('That is not a valid color :(');
		var crgb = color.toRgb();
		var text = (crgb.r * 0.299) + (crgb.g * 0.587) + (crgb.b * 0.114) > 186 ? '000000' : 'ffffff';
		await msg.channel.createMessage({embed: {
			title: "Color "+color.toHexString().toUpperCase(),
			image: {
				url: `https://via.placeholder.com/165x100/${color.toHex()}/${text}?text=${color.toHex().toUpperCase()}`
			},
			color: parseInt(color.toHex(), 16)
		}}).then(message => {
			if(!bot.posts) bot.posts = {};
			bot.posts[message.id] = {
				user: msg.author.id,
				data: color
			};
			message.addReaction("\u2705");
			message.addReaction("\u274C");
			setTimeout(()=> {
				if(!bot.posts[message.id]) return;
				message.removeReactions()
				delete bot.posts[message.id];
			}, 900000)
		}).catch(e => {
			console.log(e);
			msg.channel.createMessage('Baa! There was an error D:');
		});
	},
	alias: ['c', 'cl', 'colour', 'ch']
}