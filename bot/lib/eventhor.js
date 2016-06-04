'use strict';

var util = require('util');
var path = require('path');
var fs = require('fs');
var Bot = require('slackbots');

var EventhorBot = function Constructor(settings) {
    this.settings = settings;
    this.settings.name = this.settings.name || 'eventhor';
    //this.dbPath = settings.dbPath || path.resolve(process.cwd(), 'data', 'norrisbot.db');

    this.user = null;
    //this.db = null;
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
    this._firstRun();
    //this._connectDb();
    //this._firstRunCheck();
};

EventhorBot.prototype._firstRun = function(){
    var self = this;
    self._welcomeMessage();
}

EventhorBot.prototype._loadBotUser = function () {
    var self = this;
    this.user = this.users.filter(function (user) {
        return user.name === self.name;
    })[0];
};

EventhorBot.prototype._welcomeMessage = function () {
    console.log(this.channels);
    this.postMessageToChannel("test2", 'Hello World',
        {as_user: true});
};

EventhorBot.prototype._onMessage = function (message) {
    if (this._isChatMessage(message) &&
        this._isChannelConversation(message) &&
        !this._isFromEventhorBotBot(message)
    ) {
        this._replyToUser(message);
    }
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

EventhorBot.prototype._replyToUser = function (originalMessage) {
    var self = this;
    var channel = self._getChannelById(originalMessage.channel);
    self.postMessageToChannel(channel.name, "I am listening to you", {as_user: true});
    
    /*self.db.get('SELECT id, joke FROM jokes ORDER BY used ASC, RANDOM() LIMIT 1', function (err, record) {
        if (err) {
            return console.error('DATABASE ERROR:', err);
        }

        var channel = self._getChannelById(originalMessage.channel);
        self.postMessageToChannel(channel.name, record.joke, {as_user: true});
        self.db.run('UPDATE jokes SET used = used + 1 WHERE id = ?', record.id);
    });*/
};

EventhorBot.prototype._getChannelById = function (channelId) {
    
    return this.channels.filter(function (item) {
        return item.id === channelId;
    })[0];
};