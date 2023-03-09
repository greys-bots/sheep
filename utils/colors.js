const jimp 		= require('jimp');
const tc 		= require('tinycolor2');
const path 		= require('path');

module.exports = {
	createColorImage: async (color, options = {}) => {
		return new Promise(async (res, rej) => {
			if(color && color.toLowerCase() != 'random') color = tc(color);
			else color = tc.random();
			var c = color.toRgb();
			var size = [256, 256];
			var fontsize = 32;
			var text = [color.toHexString().toUpperCase()];
			var fontColor = (c.r * 0.299) + (c.g * 0.587) + (c.b * 0.114) < 186 ? 'white' : 'black';

			if(options.text) {
				text = options.text.split("\n");
				size = [512, 512];
				fontsize = 32;
			}

			if(options.info != undefined) {
				if(text[0] === color.toHexString().toUpperCase()) text = [];
				text = text.concat([
					`Hex: ${color.toHexString().toUpperCase()}`,
					`RGB: ${color.toRgbString()}`,
					`HSV: ${color.toHsvString()}`
				]);

				size = [512, 512];
				fontsize = 32;
			}

			new jimp(...size, color.toHex(), async (err,image)=>{
				if(err){
					console.log(err);
					return rej(err.message);
				} else {
					//all this just to get multiple lines of (potentially wrapped) text
					//to be properly centered vertically
					var font = (c.r * 0.299) + (c.g * 0.587) + (c.b * 0.114) < 186 ? jimp[`FONT_SANS_${fontsize}_WHITE`] : jimp[`FONT_SANS_${fontsize}_BLACK`];
					var jfont = await jimp.loadFont(font);
					var height = text.map(t => jimp.measureTextHeight(jfont, t, size[1])).reduce((a, b) => a + b, 0);
					var startY = size[1]/2 - height/2;
					var offset = 0;

					for(var i = 0; i < text.length; i++) {
						var fontWidth = jimp.measureText(jfont, text[i]);
						var fontHeight = jimp.measureTextHeight(jfont, text[i], size[1]);
						image.print(jfont, 0, text.length > 1 ? (startY + offset) : 0, {
							text: text[i],
							alignmentX: jimp.HORIZONTAL_ALIGN_CENTER,
							alignmentY: text.length == 1 ? jimp.VERTICAL_ALIGN_MIDDLE : null
						}, ...size, (err, img, {x,y})=>{
							offset = y - startY;
							image = img;
						})
					}

					image.getBuffer(jimp.MIME_PNG,(err,data)=>{
						res(data);
					})
				}
			})
		})
	},

	createSheepImage: async (color, options = {}) => {
		return new Promise(async (res, rej) => {
			if(color && color.toLowerCase() != 'random') color = tc(color);
			else color = tc.random();
			var c = color.toRgb();
			var size = [750, 1000];
			var fontsize = 32;
			var text = [];
			var sheep = await jimp.read(path.join(__dirname,'../sheep.png'));
			var mask = await jimp.read(path.join(__dirname,'../mask.png'));

			if(options.info != undefined) {
				text = [
				`Hex: ${color.toHexString().toUpperCase()}`,
				`RGB: ${color.toRgbString()}`,
				`HSV: ${color.toHsvString()}`
				]
			}

			new jimp(750, 1000, color.toHex(), async (err, image)=>{
				if(err){
					console.log(err);
					return rej(err.message);
				} else {
					image.mask(mask);
					sheep.composite(image, 0, 0, {
					  mode: jimp.BLEND_MULTIPLY,
					  opacitySource: .9,
					  opacityDest: 1
					});

					if(options.info != undefined) {
						var info;

						new jimp(await module.exports.createColorImage(color.toHex(), {info: true}), (err, inf) => info = inf);

						new jimp(1300, 1000, async (err, image2) => {
							await image2.composite(sheep, 549, 0);
							await image2.composite(info, 0, 244)
							
							image2.getBuffer(jimp.MIME_PNG, (err, data) => res(data));
						})
					} else {
						sheep.getBuffer(jimp.MIME_PNG, (err, data)=>{
							res(data);
						})
					}
				}
			});
		})
	},

	createWoolImage: async (color, options = {}) => {
		return new Promise(async (res, rej) => {
			if(color && color.toLowerCase() != 'random') color = tc(color);
			else color = tc.random();
			var c = color.toRgb();
			var size = [300, 300];
			var fontsize = 32;
			var text = [];
			var wool = await jimp.read(path.join(__dirname,'../wool.png'));
			var mask = wool.clone();
			mask.brightness(-1);

			var bg;
			new jimp(300, 300, 'ffffff', async (err, img) => {
				img.composite(mask, 0, 0);
				img.invert()

				mask = img.clone();

				if(options.info != undefined) {
					text = [
					`Hex: ${color.toHexString().toUpperCase()}`,
					`RGB: ${color.toRgbString()}`,
					`HSV: ${color.toHsvString()}`
					]
				}

				new jimp(300, 300, color.toHex(), async (err, image)=>{
					if(err){
						console.log(err);
						return rej(err.message);
					} else {
						image.mask(mask)
						wool.composite(image, 0, 0, {
						  mode: jimp.BLEND_MULTIPLY,
						  opacitySource: .9,
						  opacityDest: 1
						});
				

						if(options.info != undefined) {
							var info;
 
							new jimp(await module.exports.createColorImage(color.toHex(), {info: true}), (err, inf) => info = inf);

							new jimp(812, 512, async (err, image2) => {
								await image2.composite(wool, 512, 106);
								await image2.composite(info, 0, 0)
								
								image2.getBuffer(jimp.MIME_PNG, (err, data) => res(data));
							})
						} else {
							wool.getBuffer(jimp.MIME_PNG, (err, data)=>{
								res(data);
							})
						}
					}
				});
			})
		})
	},

	createWormImage: async (color, options = {}) => {
		return new Promise(async (res, rej) => {
			if(color && color.toLowerCase() != 'random') color = tc(color);
			else color = tc.random();
			var c = color.toRgb();
			var size = [750, 1000];
			var fontsize = 32;
			var text = [];
			var worm = await jimp.read(path.join(__dirname,'../worm.png'));
			var mask = await jimp.read(path.join(__dirname,'../wmask.png'));

			new jimp(768, 256, color.toHex(), async (err, image)=>{
				if(err){
					console.log(err);
					return rej(err.message);
				} else {
					image.mask(mask);
					worm.composite(image, 0, 0, {
					  mode: jimp.BLEND_MULTIPLY,
					  opacitySource: .9,
					  opacityDest: 1
					});

					worm.getBuffer(jimp.MIME_PNG, (err, data)=>{
						res(data);
					})
				}
			});
		})
	},
}