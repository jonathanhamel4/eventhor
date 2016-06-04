'use strict';

var EventhorBot = require('../lib/eventhor');

var token = "xoxb-48198778294-zdgfltz6NzSEqE2Gs9nsNy4Q";
//var dbPath = process.env.BOT_DB_PATH;
var name = "eventhor";

var eventhorBot = new EventhorBot({
    token: token,
    //dbPath: dbPath,
    name: name
});

eventhorBot.run();