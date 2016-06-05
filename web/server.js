// load the things we need
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var idEvent;
var invite;
var fs = require("fs");
// set the view engine to ejs
app.set('view engine', 'ejs');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

app.use(express.static('public'));
// parse application/json
app.use(bodyParser.json())
// use res.render to load up an ejs view file

// index page 

app.get('/event/:id', function (req, res) {
  var contents = fs.readFileSync("../data/events.json");
  var jsonContent = JSON.parse(contents)
  var id = req.param('id');
  idEvent = id;
  var tagline = (jsonContent[id]["name"] || '');
  var admin = (jsonContent[id]["owner"] || '');
  var location = (jsonContent[id]["location"] || '');
  var desc = (jsonContent[id]["description"] || '');
  var type = (jsonContent[id]["type"] || '');
  var time = (jsonContent[id]["time"] || '');
  req.params.id = jsonContent[id]["id"]
  res.render('pages/admin', {
    drinks: jsonContent,
    tagline: tagline,
    admin: admin,
    time: time,
    desc: desc,
    location: location,
    type: type,
  })
});

app.get('/event/:id/invite/:invitee', function (req, res) {
  var contents = fs.readFileSync("../data/events.json");
  var jsonContent = JSON.parse(contents);
  var id = req.param('id');
  idEvent = id;
  var invitee = req.param('invitee');
  invite = invitee;
  var name = (jsonContent[id]["name"] || '');
  var location = (jsonContent[id]["location"] || '');
  var type = (jsonContent[id]["type"] || '');
  var time = (jsonContent[id]["time"] || '');
  var description = (jsonContent[id]["description"] || '');
  var room = (jsonContent[id]["room"] || '');
  var admin = (jsonContent[id]["owner"] || '');
  res.render('pages/index', {
    name: name,
    location: location,
    type: type,
    time: time,
    description: description,
    room: room,
    invitee: invitee,
    admin: admin
  });
});

app.post('/accept', function (req, res) {

  var attendingEvent = req.body.attending;
  var events;
  fs.readFile("../data/events.json", 'utf8', function (err, data) {
    events = JSON.parse(data);
    var found = false;
    for (var i = 0; i < events[idEvent].participants.length; i++) {
      if (invite == events[idEvent].participants[i].name) {
        events[idEvent].participants[i].attending = attendingEvent;
        found = true;
        break;
      }
    }

    if (!found) {
      if (typeof events[idEvent].participants == 'undefined') {
        events[idEvent].participants = [];
      }
      events[idEvent].participants.push({ name: invite, attending: attendingEvent });
    }

    fs.writeFile("../data/events.json", JSON.stringify(events), function (error) {
      if (error) {
        console.log("Error:" + error);
      }
    })
  });
  res.end('{"success": "Successful", "status": 200}');
});

app.post('/save', function (req, res) {

  var desc = req.body.desc;
  var name = req.body.eventName;
  var loc = req.body.loc;
  var type = req.body.type;
  var admin = req.body.admin;
  var time = req.body.time;
  var events;
  fs.readFile("../data/events.json", 'utf8', function (err, data) {
    events = JSON.parse(data);
    events[idEvent].description = desc;
    events[idEvent].name = name;
    events[idEvent].location = loc;
    events[idEvent].type = type;
    events[idEvent].time = time;
    events[idEvent].admin = admin;
     
    fs.writeFile("../data/events.json", JSON.stringify(events), function (error) {
      if (error) {
        console.log("Error:" + error);
      }
    })
  });
  res.end('{"success": "Successful", "status": 200}');
});

// about page 
app.get('/', function (req, res) {
  res.render('pages/about');
});

app.use(express.static(__dirname + '/stylesheet'));

app.listen(8080);
console.log('8080 is the magic port');