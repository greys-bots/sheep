const fs = require('fs');
const {
	confirmVals: STRINGS,
	confirmReacts: REACTS,
	confirmBtns: BUTTONS
} = require('../extras');

const recursivelyReadDirectory = (dir) => {
	var results = [];
	var files = fs.readdirSync(dir, {withFileTypes: true});
	for(file of files) {
		if(file.isDirectory()) {
			results = results.concat(recursivelyReadDirectory(dir+"/"+file.name));
		} else {
			results.push(dir+"/"+file.name);
		}
	}

	return results;
}

module.exports = {
	recursivelyReadDirectory,
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
					current.embed.fields.push(await genFunc(arr[i], i, arr));
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
						fields: [await genFunc(arr[i], i, arr)]
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
				await m.edit({embeds: [this.data[this.index].embed ?? this.data[this.index]]});
				if(m.channel.type != "dm") await reaction.users.remove(this.user)
				bot.menus[m.id] = this;
				break;
			case "➡️":
				if(this.index == this.data.length-1) {
					this.index = 0;
				} else {
					this.index += 1;
				}
				await m.edit({embeds: [this.data[this.index].embed ?? this.data[this.index]]});
				if(m.channel.type != "dm") await reaction.users.remove(this.user)
				bot.menus[m.id] = this;
				break;
			case "⏹️":
				await m.delete();
				delete bot.menus[m.id];
				break;
		}
	},

	getConfirmation: async (bot, msg, user) => {
		return new Promise(res => {

			function msgListener(message) {
				if(message.channel.id != msg.channel.id ||
				   message.author.id != user.id) return;

				clearTimeout(timeout);
				bot.removeListener('messageCreate', msgListener);
				bot.removeListener('messageReactionAdd', reactListener);
				bot.removeListener('interactionCreate', intListener)
				if(STRINGS[0].includes(message.content.toLowerCase())) return res({confirmed: true, message});
				else return res({confirmed: false, message, msg: 'Action cancelled!'});
			}

			function reactListener(react, ruser) {
				if(react.message.channel.id != msg.channel.id ||
				   ruser.id != user.id) return;

				clearTimeout(timeout);
				bot.removeListener('messageCreate', msgListener);
				bot.removeListener('messageReactionAdd', reactListener);
				bot.removeListener('interactionCreate', intListener)
				if(react.emoji.name == REACTS[0]) return res({confirmed: true, react});
				else return res({confirmed: false, react, msg: 'Action cancelled!'});
			}

			function intListener(intr) {
				if(!intr.isButton()) return;
				if(intr.channelId !== msg.channel.id ||
				   intr.user.id !== user.id) return;

				clearTimeout(timeout);
				bot.removeListener('messageCreate', msgListener);
				bot.removeListener('messageReactionAdd', reactListener);
				bot.removeListener('interactionCreate', intListener)
				if(BUTTONS[0].includes(intr.customId)) return res({confirmed: true, interaction: intr});
				else return res({confirmed: false, interaction: intr, msg: 'Action cancelled!'});
			}

			const timeout = setTimeout(async () => {
				bot.removeListener('messageCreate', msgListener);
				bot.removeListener('messageReactionAdd', reactListener);
				bot.removeListener('interactionCreate', intListener)
				res({confirmed: false, msg: 'ERR! Timed out!'})
			}, 30000);

			bot.on('messageCreate', msgListener);
			bot.on('messageReactionAdd', reactListener);
			bot.on('interactionCreate', intListener)
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
				bot.removeListener('messageCreate', msgListener);
				bot.removeListener('messageReactionAdd', reactListener);
				bot.removeListener('interactionCreate', intListener)
				var choice = choices.find(c => c.accepted.includes(message.content.toLowerCase()));
				if(choice) return res({...choice, message});
				else return res({choice: 'invalid', message, msg: 'Invalid choice!'});
			}

			function reactListener(react, ruser) {
				if(react.message.channel.id != msg.channel.id ||
				   ruser.id != user.id) return;

				clearTimeout(timeout);
				bot.removeListener('messageCreate', msgListener);
				bot.removeListener('messageReactionAdd', reactListener);
				bot.removeListener('interactionCreate', intListener)
				var choice = choices.find(c => c.accepted.includes(react.emoji.name));
				if(choice) return res({...choice, react});
				else return res({choice: 'invalid', react, msg: 'Invalid choice!'});
			}

			function intListener(intr) {
				if(!intr.isButton()) return;
				if(intr.channelId !== msg.channel.id ||
				   intr.user.id !== user.id) return;

				clearTimeout(timeout);
				bot.removeListener('messageCreate', msgListener);
				bot.removeListener('messageReactionAdd', reactListener);
				bot.removeListener('interactionCreate', intListener)
				var choice = choices.find(c => c.accepted.includes(intr.customId));
				if(choice) return res({...choice, interaction: intr});
				else return res({choice: 'invalid', interaction: intr, msg: 'Invalid choice!'});
			}

			const timeout = setTimeout(async () => {
				bot.removeListener('messageCreate', msgListener);
				bot.removeListener('messageReactionAdd', reactListener);
				bot.removeListener('interactionCreate', intListener)
				res({choice: 'none', msg: 'Action timed out :('})
			}, 30000);

			bot.on('messageCreate', msgListener);
			bot.on('messageReactionAdd', reactListener);
			bot.on('interactionCreate', intListener)
		})
	}
}