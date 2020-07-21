require('dotenv').config();

const {manager, ipc} = require('./bot/index');

const app = require('./site/index');
app.listen(process.env.PORT || 8080);

process.on(`SIGTERM`, ()=> {
    console.log("Ending connections...");
    try {
        ipc.server.stop();
    } catch(e) {
        console.log(e.message);
    }
    process.exit();
})

//for ctrl+c-ing
process.on(`SIGINT`, ()=> {
    console.log("Ending connections...");
    try {
        ipc.server.stop();
    } catch(e) {
        console.log(e.message);
    }
    process.exit();
})