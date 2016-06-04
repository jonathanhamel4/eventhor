'use strict';

var EventhorBot = require('../lib/eventhor');

var token = "YOUR TOKEN";
//var dbPath = process.env.BOT_DB_PATH;
var name = "eventhor";

var eventhorBot = new EventhorBot({
    token: token,
    //dbPath: dbPath,
    name: name
});

eventhorBot.run();