const express 	= require('express');
const path 		= require('path');
const fs  		= require('fs');
const session 	= require('express-session');

require('dotenv').config();

const app 		= express();
const ipc 		= require(__dirname + '/modules/ipc')();

app.use(require('cookie-parser')());
app.use(session({
	cookie: {maxAge: 60 * 60 * 1000},
	secret: process.env.CLIENT_SECRET, //easiest?
	resave: true,
	saveUninitialized: false
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(async (req, res, next) => {
	if(req.session?.user) return next();

	var token = await app.stores.tokens.getByToken(req.headers['authorization']);
	if(!token) return next();

	req.session.user = ipc.data.users.find(u => u.id == token.user_id);
	req.session.save();

	next();
})

app.db = require(__dirname + '/../common/stores/__db')(app);

require(__dirname + '/modules/routes')(app, ipc);

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
if(process.env.STANDALONE) app.listen(process.env.PORT);