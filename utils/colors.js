module.exports = {
	toCmyk: async (color) => {
		//code based on this: http://www.javascripter.net/faq/rgb2cmyk.htm
		return new Promise(res => {
			var rgb = color.toRgb();
			if(rgb.r == 0 && rgb.g == 0 && rgb.b == 0) return res({c: 0, m: 0, y: 0, k: 1});

			var c = 1 - rgb.r/255;
			var m = 1 - rgb.g/255;
			var y = 1 - rgb.b/255;

			var k = Math.min(c, Math.min(m, y));
			c = (c - k)/(1 - k);
			m = (m - k)/(1 - k);
			y = (y - k)/(1 - k);

			res({c, m, y, k});
		})
	},
	mixColors: async (bot, c1, c2) => {
		return new Promise(async res => {
			c1 = c1.toHex();
			c2 = c2.toHex();
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
			res(bot.tc(c));
		})
	}
}