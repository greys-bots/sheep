module.exports = {
	help: ()=> "Mix two colors",
	usage: ()=> [" [color1] [color2] - Mixes two colors and gives the result. NOTE: currentl only accepts rgb/hsv values without spaces! eg: rgb(0,0,0)"],
	execute: async (bot, msg, args)=> {
		var col1 = bot.tc(args[0]);
		var col2 = bot.tc(args[1]);
		if(!col1.isValid() || !col2.isValid) return "One of those isn't a valid color :(";
		var c1 = col1.toHex();
		console.log(c1);
		var c2 = col2.toHex();
		console.log(c2);
		var c = "";
		for(var i = 0; i<3; i++) {
		  var sub1 = c1.substring(2*i, 2+2*i);
		  var sub2 = c2.substring(2*i, 2+2*i);
		  var v1 = parseInt(sub1, 16);
		  var v2 = parseInt(sub2, 16);
		  var v = Math.floor((v1 + v2) / 2);
		  var sub = v.toString(16).toUpperCase();
		  var padsub = ('0'+sub).slice(-2);
		  c += padsub;
		}
		await msg.channel.createMessage({embed: {
			title: "Color #"+c,
			image: {
				url: `https://sheep.greysdawn.com/sheep/${c}`
			},
			color: parseInt(c, 16)
		}})
		return;
	},
	alias: ['m', 'blend']
}