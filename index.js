const express 	= require('express');
const path 	= require('path');
const fs  	= require('fs');

require('dotenv').config();

const app 		= express();
const ipc 		= require('./modules/ipc')();
const routes 	= require('./modules/routes')(app, ipc);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

console.log("Sheep ready!");
module.exports = app;
// app.listen(process.env.PORT || 8080);