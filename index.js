const fs 		= require('fs');
const path 		= require('path');
const express 	= require('express');
const jimp 		= require('jimp');
const tc 		= require('tinycolor2');
const pgIPC 	= require('pg-ipc');

require('dotenv').config();

const app 		= express();
const ipc 		= require('node-ipc');
var commands 	= {};
var modules		= {};
var stats 		= {};

ipc.config.id = 'sheep-site';
ipc.config.silent = true;
ipc.config.sync = true;

ipc.connectTo('sheep-bot', function() {
	ipc.of['sheep-bot'].on('STATS', function(msg) {
		console.log('stats received!');
		stats = msg;
	})

	ipc.of['sheep-bot'].on('COMMANDS', function(msg) {
		console.log('commands received!');
		commands = msg.cmds;
		modules = msg.mods;
	})
})

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

async function setup() {
	ipc.of['sheep-bot'].emit('STATS');
	setInterval(()=> ipc.of['sheep-bot'].emit('STATS'), 1000 * 60 * 10);

	ipc.of['sheep-bot'].emit('COMMANDS');
	setInterval(()=> ipc.of['sheep-bot'].emit('COMMANDS'), 1000 * 60 * 10);
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
		var mask = await jimp.read(path.join(__dirname,'mask.png'));
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
	res.send({commands, modules});
})

app.get('/info', async (req, res)=> {
	res.send(stats);
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
console.log("Sheep ready.");
// module.exports = app;
app.listen(process.env.PORT || 8080);