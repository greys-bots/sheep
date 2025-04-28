const fs = require('fs');
const {
	confirmVals: STRINGS,
	confirmReacts: REACTS,
	confirmBtns: BUTTONS
} = require('../extras');

module.exports = {
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
	},

	genComps: (arr, fn, limit = 9) => {
		// limit of 9 to allow for a title in the container
		let comps = [];
		let cur = [];
		for(var i = 0; i < arr.length; i++) {
			if(cur.length == limit) {
				comps.push(cur);
				cur = [];
			}

			cur.push(fn(arr[i], i, arr))
		}

		comps.push(cur);
		return comps;
	}
}