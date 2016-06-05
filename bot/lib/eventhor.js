'use strict';

var util = require('util');
var path = require('path');
var fs = require('fs');
var Bot = require('slackbots');
var Entities = require('html-entities').XmlEntities;
var Schedule = require('node-schedule');

var EventhorBot = function Constructor(settings) {
    this.settings = settings;
    this.settings.name = this.settings.name || 'eventhor';
    this.dbPath = "../../data/events.json";
    this.entities = new Entities();
    this.user = null;
    this.serverPath = "http://localhost:8080";
    this.eventPath = "/event/";
    this.invitePath = "/invite/";
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
    this._scheduleStartUpJob();
};

EventhorBot.prototype._loadBotUser = function () {
    var self = this;
    this.user = this.users.filter(function (user) {
        return user.name === self.name;
    })[0];
};

EventhorBot.prototype._onMessage = function (message) {
    if (this.user === null) {
        this.loadBotUser();
    }

    if (this._isChatMessage(message) &&
        !this._isFromEventhorBotBot(message) &&
        message.text.toLowerCase().indexOf("eventhor") == 0
    ) {
        message.text = message.text.substring(8).trim();
        var channel = this._getChannelById(message.channel);
        var user = this._getUserById(message.user);
        if (this._isInvokingEventhor(message)) {
            this._replyHelpMessage(user, channel);
        }
        else if (this._isCreating(message)) {
            this._createEvent(user, message);
        }
        else if (this._isInviting(message)) {
            this._inviteUser(user, message);
        }
        else if (this._isListing(message)) {
            this._listEvents(user, channel);
        }
        else if (this._isAccepting(message)) {
            this._acceptEvent(user, message, channel);
        }
        else {
            this._showEvent(user, message, channel);
        }
    }
};

EventhorBot.prototype._isInvokingEventhor = function (message) {
    return message.text.trim().toLowerCase() == "help" || message.text.trim().toLowerCase() == "";
};

EventhorBot.prototype._isInviting = function (message) {
    return message.text.toLowerCase().indexOf("invite") > -1;
};

EventhorBot.prototype._isAccepting = function (message) {
    return message.text.toLowerCase().indexOf("accept") > -1 || message.text.toLowerCase().indexOf("decline") > -1;
};

EventhorBot.prototype._isListing = function (message) {
    return message.text.toLowerCase().indexOf("list") > -1;
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

EventhorBot.prototype._replyHelpMessage = function (user, channel) {
    var self = this;
    var text = 'Hey ' + user.name + '. Need help?\n' +
        "Here are the available commands to you. Don't forget to always write _eventhor_ before any command. \n" +
        '>>> • _create event-name_ \n' +
        '• _invite event-name, list-usernames-comma-separated_ \n' +
        '• _accept event-name_ \n' +
        '• _decline event-name_ \n' +
        '• _list_ \n' +
        '• _event-name_ \n';
    if (channel.name) {
        self.postMessageToChannel(channel.name, text, { as_user: true });
    }
    else {
        self.postMessageToUser(user.name, text, { as_user: true });
    }
};

EventhorBot.prototype._getChannelById = function (channelId) {
    return this.channels.filter(function (item) {
        return item.id === channelId;
    })[0] || channelId;
};

EventhorBot.prototype._getUserById = function (userId) {

    return this.users.filter(function (item) {
        return item.id === userId;
    })[0];
};

EventhorBot.prototype._createEvent = function (user, message) {
    var self = this;
    var text = message.text.substr(6).trim();
    var event = {};
    event.name = text;
    event.owner = user.name;
    event.participants = [];
    self._writeEvent(user, event, message.channel);
};

EventhorBot.prototype._writeEvent = function (user, event, channelName) {
    var events;
    var self = this;
    fs.readFile(self.dbPath, 'utf8', function (err, data) {
        events = JSON.parse(data);
        var dbEvent = events.filter(function (evt) {
            return evt.name.toLowerCase() == event.name.toLowerCase();
        });
        if (typeof dbEvent == 'undefined' || dbEvent.length == 0) {
            event.id = events.length;
            events.push(event);
            fs.writeFile(self.dbPath, JSON.stringify(events), function (error) {
                if (error) {
                    console.log("Error:" + error);
                }
                else {
                    self._replyEventCreated(user, event, channelName, false)
                }
            });
        } else {
            self._replyEventCreated(user, event, channelName, true)
        }
    });
};

EventhorBot.prototype._replyEventCreated = function (user, event, channel, error) {
    var self = this;
    var channelName = self._getChannelById(channel);
    var msg = error? "There is already an event named <" + self.serverPath + self.eventPath + event.id + "|*" + event.name + "*>\n. Write _eventhor " + event.name + "_ to view it." : 'Do you want to invite people to <' + self.serverPath + self.eventPath + event.id + "|*" + event.name + '*>?\n>>> Just write " _invite event-name, list-usernames-comma-separated_ ".';
    if (channelName.name) {
        self.postMessageToChannel(channelName.name, msg, { as_user: true });
    }
    else {
        self.postMessageToUser(user.name, msg, { as_user: true });
    }
};

EventhorBot.prototype._inviteUser = function (user, message) {
    var self = this;
    var msg = message.text.substr(6).trim();
    var eventName = msg.substring(0, msg.indexOf(","));
    var userNames = msg.substring(msg.indexOf(",") + 1).split(",");
    var invites = [];
    for (var i = 0; i < userNames.length; i++) {
        invites.push({
            eventName: eventName,
            user: userNames[i].trim(),
            owner: user.name
        });
    }
    self._sendInvite(invites);
};

EventhorBot.prototype._sendInvite = function (invites) {
    var self = this;
    fs.readFile(self.dbPath, 'utf8', function (err, data) {
        var events = JSON.parse(data);
        for (var i = 0; i < events.length; i++) {
            if (invites[0].eventName.trim().toLowerCase() == events[i].name.trim().toLowerCase()) {
                for (var j = 0; j < invites.length; j++) {
                    var msg = invites[j].owner + ' just sent you an invite to <' + self.serverPath + self.eventPath + events[i].id + self.invitePath + invites[j].user + '|*' + invites[j].eventName + '*>!' +
                        '\n>>>To answer, just say " _accept event name_ "\n';
                    self.postMessageToUser(invites[j].user, msg, { as_user: true });
                }
                break;
            }
        }
    });
};

EventhorBot.prototype._listEvents = function (user, channel) {
    var self = this;
    fs.readFile(self.dbPath, 'utf8', function (err, data) {
        var events = JSON.parse(data);
        var msg = "";
        var currentDate = new Date();
        for (var i = 0; i < events.length; i++) {
            if (typeof events[i].time == 'undefined' || new Date(events[i].time) > currentDate) {
                msg += "> <" + self.serverPath + self.eventPath + events[i].id + "|*" + events[i].name + "*> \n";
                msg += "> Description: " + (events[i].description || " not available") + " \n";
                msg += "> Date:" + (events[i].date || " not available") + " \n";
                msg += "> Location: " + (events[i].location || " not available") + " \n\n";
            }
        }

        if (msg == "") {
            msg = "There are no events";
        }
        if (channel.name) {
            self.postMessageToChannel(channel.name, msg, { as_user: true });
        }
        else {
            self.postMessageToUser(user.name, msg, { as_user: true });
        }
    });
};

EventhorBot.prototype._showEvent = function (user, message, channel) {
    var self = this;
    fs.readFile(self.dbPath, 'utf8', function (err, data) {
        var events = JSON.parse(data);
        var msg = "There is no event named *" + message.text + "*";
        for (var i = 0; i < events.length; i++) {
            if (message.text.toLowerCase() == events[i].name.toLowerCase()) {
                msg = ">>> <" + self.serverPath + self.eventPath + events[i].id + "|*" + events[i].name + "*> \n";
                msg += " Description: " + (events[i].description || " not available") + " \n";
                msg += " Date:" + (events[i].date || " not available") + " \n";
                msg += " Location: " + (events[i].location || " not available") + " \n";
                if (events[i].participants) {
                    msg += " Participants:\n"
                    for (var j = 0; j < events[i].participants.length; j++) {
                        if (events[i].participants[j].name != '' && events[i].participants[j].attending == true)
                            msg += "> " + events[i].participants[j].name + "\n";
                    }
                }
                break;
            }
        }
        if (channel.name) {
            self.postMessageToChannel(channel.name, msg, { as_user: true });
        }
        else {
            self.postMessageToUser(user.name, msg, { as_user: true });
        }
    });
};

EventhorBot.prototype._acceptEvent = function (user, message, channel) {
    var self = this;
    var accept = message.text.toLowerCase().indexOf("accept") > -1;
    var indexOfSub = accept ? 6 : 7;
    fs.readFile(self.dbPath, 'utf8', function (err, data) {
        var events = JSON.parse(data);
        message.text = message.text.substring(indexOfSub).trim();
        var msg = "There is no event named *" + message.text + "*";
        for (var i = 0; i < events.length; i++) {
            if (message.text.toLowerCase() == events[i].name.toLowerCase()) {
                var participantEdited = false;
                if (events[i].participants) {
                    for (var j = 0; j < events[i].participants.length; j++) {
                        if (events[i].participants[j].name.toLowerCase() == user.name.toLowerCase()) {
                            events[i].participants[j].attending = accept;
                            participantEdited = true;
                            break;
                        }
                    }
                } else {
                    events[i].participants = [];
                }

                if (!participantEdited) {
                    events[i].participants.push({ name: user.name, attending: accept });
                }
                msg = "You were" + (accept ? " added to " : " removed from ") + "<" + self.serverPath + self.eventPath + events[i].id + "|*" + events[i].name + "*>";
                break;
            }
        }

        fs.writeFile(self.dbPath, JSON.stringify(events), function (error) {
            if (error) {
                console.log("Error:" + error);
            }
            else {
                self._replyEventAccepted(user, channel, msg)
            }
        })
    });
};

EventhorBot.prototype._replyEventAccepted = function (user, channel, txt) {
    var self = this;
    var channelName = self._getChannelById(channel);
    if (channel.name) {
        self.postMessageToChannel(channelName.name, txt, { as_user: true });
    }
    else {
        self.postMessageToUser(user.name, txt, { as_user: true });
    }
};

EventhorBot.prototype._scheduleStartUpJob = function () {
    var rule = new Schedule.RecurrenceRule();
    rule.minute = 53;
    var self = this;
    var j = Schedule.scheduleJob(rule, function () {
        self._setReminders();
    });
};

EventhorBot.prototype._setReminders = function () {
    var self = this;
    fs.readFile(self.dbPath, 'utf8', function (err, data) {
        if (!err) {
            var events = JSON.parse(data);
            for (var i = 0; i < events.length; i++) {
                if (typeof events[i].reminderTime != 'undefined' && events[i].reminderTime.isSet == false) {
                    for (var j = 0; j < events[i].reminderTime.time.length; j++) {
                        var date = new Date(events[i].time);
                        date.setMinutes(date.getMinutes() - events[i].reminderTime.time[j]);
                        var event = events[i];
                        var k = Schedule.scheduleJob(date, function (event) {
                            var text = ">>> <" + self.serverPath + self.eventPath + event.id + "|*" + event.name + "*>" + " will be occuring at " + event.time;
                            for (var l = 0; l < event.participants.length; l++) {
                                if (event.participants[l].attending == true) {
                                    self.postMessageToUser(event.participants[l].name, text, { as_user: true });
                                }
                            }
                        }.bind(null, event, self));
                    }
                    events[i].reminderTime.isSet = true;
                }
            }
            fs.writeFile(self.dbPath, JSON.stringify(events), function (error) {
                if (error) {
                    console.log("Error:" + error);
                }
            });
        }
    });
};



