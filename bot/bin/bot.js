'use strict';

var EventhorBot = require('../lib/eventhor');

var token = "xoxb-48198778294-icMiyBZy94j7UfuS9a2mpcpr";
//var dbPath = process.env.BOT_DB_PATH;
var name = "eventhor";

var eventhorBot = new EventhorBot({
    token: token,
    //dbPath: dbPath,
    name: name
});

eventhorBot.run();