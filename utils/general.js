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
			case "⬅️":
				if(this.index == 0) {
					this.index = this.data.length-1;
				} else {
					this.index -= 1;
				}
				await m.edit(this.data[this.index]);
				await reaction.users.remove(this.user)
				bot.menus[m.id] = this;
				break;
			case "➡️":
				if(this.index == this.data.length-1) {
					this.index = 0;
				} else {
					this.index += 1;
				}
				await m.edit(this.data[this.index]);
				await reaction.users.remove(this.user)
				bot.menus[m.id] = this;
				break;
			case "⏹️":
				await m.delete();
				delete bot.menus[m.id];
				break;
		}
	},
	cleanText: function(text){
		if (typeof(text) === "string") {
			return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
		} else	{
			return text;
		}
	},
	
	checkPermissions: async (bot, msg, cmd)=>{
		return new Promise((res)=> {
			if(cmd.permissions) res(msg.member.permissions.has(cmd.permissions))
			else res(true);
		})
	},
	isDisabled: async (bot, srv, cmd, name) =>{
		return new Promise(async res=>{
			var cfg = await bot.stores.configs.get(srv);
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

	getConfirmation: async (bot, msg, user) => {
		return new Promise(res => {

			function msgListener(message) {
				if(message.channel.id != msg.channel.id ||
				   message.author.id != user.id) return;

				clearTimeout(timeout);
				bot.removeListener('message', msgListener);
				bot.removeListener('messageReactionAdd', reactListener);
				switch(message.content.toLowerCase()) {
					case 'y':
					case 'yes':
					case '✅':
						return res({confirmed: true, message});
						break;
					default:
						return res({confirmed: false, message, msg: 'Action cancelled!'});
						break;
				}
			}

			function reactListener(react, ruser) {
				if(react.message.channel.id != msg.channel.id ||
				   ruser.id != user.id) return;

				clearTimeout(timeout);
				bot.removeListener('message', msgListener);
				bot.removeListener('messageReactionAdd', reactListener);
				switch(react.emoji.name) {
					case '✅':
						return res({confirmed: true, react});
						break;
					default:
						return res({confirmed: false, react, msg: 'Action cancelled!'});
						break;
				}
			}

			const timeout = setTimeout(async () => {
				bot.removeListener('message', msgListener);
				bot.removeListener('messageReactionAdd', reactListener);
				res({confirmed: false, msg: 'Action timed out :('})
			}, 30000);

			bot.on('message', msgListener);
			bot.on('messageReactionAdd', reactListener);
		})
	},
	handleChoices: async (bot, msg, user, choices) => {
		/*
			example usage pseudo-code:
			choices = [
				{
					accepted: ['y', 'yes', 'yeah', '✅'],
					name: 'yes',
					msg: 'You picked `yes`.'
				},
				{
					accepted: ['n', 'no', 'nah', '❌'],
					name: 'no',
					msg: 'You picked `no`.'
				}
			]
			chosen = await handleChoices(...args);
			switch(chosen.name) {
				case 'yes':
				case 'no':
					return chosen.msg;
					break;
				case 'invalid':
					return 'You picked something else.';
					break;
				default:
					return 'You picked nothing.'
					break;
			}
		*/
		return new Promise(res => {

			function msgListener(message) {
				if(message.channel.id != msg.channel.id ||
				   message.author.id != user.id) return;

				clearTimeout(timeout);
				bot.removeListener('message', msgListener);
				bot.removeListener('messageReactionAdd', reactListener);
				var choice = choices.find(c => c.accepted.includes(message.content.toLowerCase()));
				if(choice) return res({...choice, message});
				else return res({choice: 'invalid', message, msg: 'Invalid choice!'});
			}

			function reactListener(react, ruser) {
				if(react.message.channel.id != msg.channel.id ||
				   ruser.id != user.id) return;

				clearTimeout(timeout);
				bot.removeListener('message', msgListener);
				bot.removeListener('messageReactionAdd', reactListener);
				var choice = choices.find(c => c.accepted.includes(react.emoji.name));
				if(choice) return res({...choice, react});
				else return res({choice: 'invalid', react, msg: 'Invalid choice!'});
			}

			const timeout = setTimeout(async () => {
				bot.removeListener('message', msgListener);
				bot.removeListener('messageReactionAdd', reactListener);
				res({choice: 'none', msg: 'Action timed out :('})
			}, 30000);

			bot.on('message', msgListener);
			bot.on('messageReactionAdd', reactListener);
		})
	}
}