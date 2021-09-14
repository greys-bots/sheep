module.exports = {
	data: {
		name: 'eval',
		description: "Evaluate javascript code",
		type: 1,
		options: [{
			name: 'code',
			description: "The code to evaluate",
			type: 3,
			required: true
		}]
	},
	usage: [
		'[code] - Eval the given code'
	],
	async execute(ctx) {
		if(ctx.user.id !== ctx.client.owner) return "Only the bot owner can use this!";
		
		var code = ctx.options.getString('code');

		try {
			let evld = await eval(code);
			if(typeof(evld) !== "string") evld = require("util").inspect(evld);
			return evld;
		} catch (err) {
			if(err) console.log(err);
			return err.message ?? err;
		}
	}
}