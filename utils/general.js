module.exports = {
	genEmbeds: async (bot, arr, genFunc, info = {}, fieldnum, extras = {}) => {
		return new Promise(async res => {
			var embeds = [];
			var current = { embed: {
				title: typeof info.title == "function" ?
								info.title(arr[0], 0) : info.title,
						description: typeof info.description == "function" ?
								info.description(arr[0], 0) : info.description,
				color: typeof info.color == "function" ?
						info.color(arr[0], 0) : info.color,
				footer: info.footer,
				fields: []
			}};
			
			for(let i=0; i<arr.length; i++) {
				if(current.embed.fields.length < (fieldnum || 10)) {
					current.embed.fields.push(await genFunc(arr[i], bot));
				} else {
					embeds.push(current);
					current = { embed: {
						title: typeof info.title == "function" ?
								info.title(arr[i], i) : info.title,
						description: typeof info.description == "function" ?
								info.description(arr[i], i) : info.description,
						color: typeof info.color == "function" ?
								info.color(arr[i], i) : info.color,
						footer: info.footer,
						fields: [await genFunc(arr[i], bot)]
					}};
				}
			}
			embeds.push(current);
			if(extras.order && extras.order == 1) {
				if(extras.map) embeds = embeds.map(extras.map);
				if(extras.filter) embeds = embeds.filter(extras.filter);
			} else {
				if(extras.filter) embeds = embeds.filter(extras.filter);
				if(extras.map) embeds = embeds.map(extras.map);
			}
			if(embeds.length > 1) {
				for(let i = 0; i < embeds.length; i++)
					embeds[i].embed.title += (extras.addition != null ? eval("`"+extras.addition+"`") : ` (page ${i+1}/${embeds.length}, ${arr.length} total)`);
			}
			res(embeds);
		})
	},
	paginateEmbeds: async function(bot, m, reaction) {
		switch(reaction.emoji.name) {
			case "\u2b05":
				if(this.index == 0) {
					this.index = this.data.length-1;
				} else {
					this.index -= 1;
				}
				await m.edit(this.data[this.index]);
				await reaction.users.remove(this.user)
				bot.menus[m.id] = this;
				break;
			case "\u27a1":
				if(this.index == this.data.length-1) {
					this.index = 0;
				} else {
					this.index += 1;
				}
				await m.edit(this.data[this.index]);
				await reaction.users.remove(this.user)
				bot.menus[m.id] = this;
				break;
			case "\u23f9":
				await m.delete();
				delete bot.menus[m.id];
				break;
		}
	},
	
	checkPermissions: async (bot, msg, cmd)=>{
		return new Promise((res)=> {
			if(cmd.permissions) {
				console.log(msg.member.permissions);
				console.log(msg.member.permissions.has(cmd.permissions))
				res(msg.member.permissions.has(cmd.permissions))
			} else {
				res(true);
			}
		})
	},
	isDisabled: async (bot, srv, cmd, name) =>{
		return new Promise(async res=>{
			var cfg = await bot.utils.getConfig(bot, srv);
			if(!cfg || !cfg.disabled || !cfg.disabled[0]) return res(false);
			let dlist = cfg.disabled;
			name = name.split(" ");
			if(dlist && (dlist.includes(name[0]) || dlist.includes(name.join(" ")))) {
				res(true);
			} else {
				res(false);
			}
		})
	},

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