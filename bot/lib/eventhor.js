'use strict';

var util = require('util');
var path = require('path');
var fs = require('fs');
var Bot = require('slackbots');

var EventhorBot = function Constructor(settings) {
    this.settings = settings;
    this.settings.name = this.settings.name || 'eventhor';
    this.dbPath = "../../data/events.json";

    this.user = null;
};

// inherits methods and properties from the Bot constructor
util.inherits(EventhorBot, Bot);

module.exports = EventhorBot;

EventhorBot.prototype.run = function () {
    EventhorBot.super_.call(this, this.settings);

    this.on('start', this._onStart);
    this.on('message', this._onMessage);
};

EventhorBot.prototype._onStart = function () {
    this._loadBotUser();
};

EventhorBot.prototype._loadBotUser = function () {
    var self = this;
    this.user = this.users.filter(function (user) {
        return user.name === self.name;
    })[0];
};

/*EventhorBot.prototype._welcomeMessage = function () {
    var newChannels = [];
    var oldChannels;
    var self = this;
    fs.readFile('../../data/invites.json', 'utf8', function (err, data) {
        if (err) { console.log(err); return; }
        var channels = self.channels;
        oldChannels = JSON.parse(data);
        for (var i = 0; i < channels.length; i++) {
            var channelFound = false;
            var isMember = channels[i].is_member
            if (isMember) {
                for (var j = 0; j < oldChannels.length; j++) {
                    if (oldChannels[j] == channels[i].id && channels[i].is_member === true) {
                        channelFound = true;
                    }
                }
            }
            if (!channelFound && isMember) {
                self.postMessageToChannel(channels[i].name, 'Hello World', { as_user: true });
                newChannels.push(channels[i].id);
            }
        }
        var updatedChannels = newChannels.concat(oldChannels);
        fs.writeFile('../../data/invites.json', JSON.stringify(updatedChannels), function (error) { console.log(error); });
    });
};*/


EventhorBot.prototype._onMessage = function (message) {
    if (!this.name) {
        this.loadBotUser();
    }
    if (this._isChatMessage(message) &&
        this._isChannelConversation(message) &&
        !this._isFromEventhorBotBot(message)
    ) {
        var channel = this._getChannelById(message.channel);
        var user = self._getUserById(message.user);
        if (this._isInvokingEventhor(message)) {
            this._replyHelpMessage(user, channel);
        }
        else if (this._isCreating(message)) {
            //this._createEvent(message);
        }
        else {
            this._replyToUser(channel);
        }
    }
};

EventhorBot.prototype._isInvokingEventhor = function (message) {
    return message.text.trim().toLowerCase() === "eventhor";
};

EventhorBot.prototype._isCreating = function (message) {
    return message.text.toLowerCase().indexOf("create") > -1;
};

EventhorBot.prototype._isChatMessage = function (message) {
    return message.type === 'message' && Boolean(message.text);
};

EventhorBot.prototype._isChannelConversation = function (message) {
    return typeof message.channel === 'string' &&
        message.channel[0] === 'C';
};

EventhorBot.prototype._isFromEventhorBotBot = function (message) {
    return message.user === this.user.id;
};

EventhorBot.prototype._replyToUser = function (channel) {
    var self = this;
    self.postMessageToChannel(channel.name, "I am listening to you", { as_user: true });
};

EventhorBot.prototype._replyHelpMessage = function (user, channel) {
    var self = this;
    self.postMessageToChannel(channel.name,
        'Hey ' + user.name + '. Need help?\n' +
        'Here are the available commands to you:\n' +
        '>>> • _create <event> <eventType> <date> <time>_\n' +
        '• _invite <name> <event>_'
        , { as_user: true });
};

EventhorBot.prototype._getChannelById = function (channelId) {

    return this.channels.filter(function (item) {
        return item.id === channelId;
    })[0];
};

EventhorBot.prototype._getUserById = function (userId) {

    return this.users.filter(function (item) {
        return item.id === userId;
    })[0];
};

/*EventhorBot.prototype._createEvent = function (user, message) {
    var self = this;
    var text = message.text;
    var rx = /<(.*?)>/g;
    var params = text.match(rx);
    var event = {};
    event.name = params[0].substring(1, params[0].length - 2).trim();
    event.type = params[1].substring(1, params[0].length - 2).trim();
    event.date = params[2].substring(1, params[0].length - 2).trim();
    event.time = params[3].substring(1, params[0].length - 2).trim();
    event.owner = user.name;
    self._writeEvent(event);
};

EventhorBot.prototype._writeEvent = function (event) {
    var events = [];
    event.push(event);    
    fs.writeFile(this.dbPath,JSON.stringify(events), function(error){console.log(error);})
};*/
