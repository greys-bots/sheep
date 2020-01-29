const fs 		= require('fs');
const path 		= require('path');
const express 	= require('express');
const jimp 		= require('jimp');
const tc 		= require('tinycolor2');
const eris 		= require('eris');

require('dotenv').config();

const app = express();

const bot = eris(process.env.TOKEN_SHEEP);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const commands = {};

async function setup() {
	var files = fs.readdirSync(path.join(__dirname, "commands"));
	await Promise.all(files.map(f => {
		commands[f.slice(0,-3)] = require(path.join(__dirname, "commands", f));
		return new Promise((res,rej)=>{
			setTimeout(res(),100)
		})
	})).then(()=> console.log("Finished loading commands."));
}

async function getCommand(cmd) {
	return new Promise(res => {
		if(!cmd) return res(false);
		cmd = cmd.toLowerCase();
		var command = commands[cmd];
		if(!command) return res(undefined);
		res({name: cmd, data: commands[cmd]});
	})
}

async function getCommands() {
	return new Promise(res => {
		var cmds = Object.keys(commands).map(k => {
			return {name: k, data: commands[k]}
		});
		res(cmds);
	})
}

async function createColorImage(color) {
	return new Promise(async res => {
		color = tc(color);
		var c = color.toRgb();
		var img;
		new jimp(256,256,color.toHex(),(err,image)=>{
			if(err){
				console.log(err);
				msg.channel.createMessage("Something went wrong.");
			} else {
				var font = (c.r * 0.299) + (c.g * 0.587) + (c.b * 0.114) < 186 ? jimp.FONT_SANS_32_WHITE : jimp.FONT_SANS_32_BLACK;
				jimp.loadFont(font).then(fnt=>{
					image.print(fnt,0,0,{
						text:(color.toHexString().toUpperCase()),
						alignmentX: jimp.HORIZONTAL_ALIGN_CENTER,
						alignmentY: jimp.VERTICAL_ALIGN_MIDDLE
					}, 256, 256, (err,img,{x,y})=>{
						img.getBuffer(jimp.MIME_PNG,(err,data)=>{
							res(data);
						})
					})

				})

			}
		})
	})
}

async function createSheepImage(color) {
	return new Promise(async res => {
		color = tc(color);
		var c = color.toRgb();
		var img;
		var sheep = await jimp.read(path.join(__dirname,'sheep.png'));
		var mask = await jimp.read(path.join(__dirname,'mask2.png'));
		new jimp(750,1000,color.toHex(),(err,image)=>{
			if(err){
				console.log(err);
				msg.channel.createMessage("Something went wrong.");
			} else {
				image.mask(mask);
				sheep.composite(image, 0, 0, {
				  mode: jimp.BLEND_MULTIPLY,
				  opacitySource: .9,
				  opacityDest: 1
				});
				sheep.getBuffer(jimp.MIME_PNG,(err,data)=>{
					res(data);
				})
			}
		});
	})
}

app.get('/color/random', async (req, res)=> {
	var color = Math.floor(Math.random()*16777215).toString(16);
	var img = await createColorImage(color);
	res.type('png');
	res.write(img);
	res.end();
})

app.get('/color/:col', async (req, res)=> {
	var img = await createColorImage(req.params.col);
	res.type('png');
	res.write(img);
	res.end();
})

app.get('/sheep/random', async (req, res)=> {
	var color = Math.floor(Math.random()*16777215).toString(16);
	var img = await createSheepImage(color);
	res.type('png');
	res.write(img);
	res.end();
})

app.get('/sheep/:col', async (req, res)=> {
	var img = await createSheepImage(req.params.col);
	res.type('png');
	res.write(img);
	res.end();
})

app.get('/command/:cmd', async (req, res)=> {
	var cmd = await getCommand(req.params.cmd);
	res.send(cmd);
})

app.get('/commands', async (req, res)=> {
	var cmd = await getCommands();
	res.send(cmd);
})

app.get('/info', async (req, res)=> {
	res.send({guilds: bot.guilds.size, users: bot.users.size});
})

app.get('/', async (req, res)=> {
	var index = fs.readFileSync(path.join(__dirname,'frontend','build','index.html'),'utf8');
	index = index.replace('$TITLE','Sheep Docs')
				 .replace('$DESC','Documentation for a bot called Sheep')
				 .replace('$TWITDESC','Documentation for a bot called Sheep')
				 .replace('$TWITTITLE','Sheep Docs')
				 .replace('$OGTITLE','Sheep Docs')
				 .replace('$OGDESC','Documentation for a bot called Sheep')
				 .replace('$OEMBED','oembed.json');
	res.send(index);
})

app.use(express.static(path.join(__dirname, 'frontend','build')));

app.use(async (req, res)=> {
	var index = fs.readFileSync(path.join(__dirname,'frontend','build','index.html'),'utf8');
	index = index.replace('$TITLE','Sheep Docs')
				 .replace('$DESC','Documentation for a bot called Sheep')
				 .replace('$TWITDESC','Documentation for a bot called Sheep')
				 .replace('$TWITTITLE','Sheep Docs')
				 .replace('$OGTITLE','Sheep Docs')
				 .replace('$OGDESC','Documentation for a bot called Sheep')
				 .replace('$OEMBED','oembed.json');
	res.send(index);
})

setup();
bot.connect();
console.log("Sheep ready.");
module.exports = app;