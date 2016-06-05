// load the things we need
var express = require('express');
var app = express();

// set the view engine to ejs
app.set('view engine', 'ejs');

// use res.render to load up an ejs view file

// index page 
app.get('/event/:eventId', function(req, res) {
  var fs = require("fs");
  var contents = fs.readFileSync("events.json");
  var jsonContent = JSON.parse(contents);
    var tagline = jsonContent[0]["eventName"];
    req.params.eventId = jsonContent[0]["eventId"];
    res.render('pages/admin', {
        drinks: jsonContent,
        tagline: tagline
    });
});

app.get('/event/:id/invite/:invitee', function(req, res) {
  var fs = require("fs");
  var contents = fs.readFileSync("../data/events.json");
  var jsonContent = JSON.parse(contents);
  var id = req.param('id');
  var invitee     = req.param('user');  
  var name        = jsonContent[id]["name"];
  var location    = jsonContent[id]["location"];
  var type        = jsonContent[id]["type"];
  var time        = jsonContent[id]["time"];
  var description = jsonContent[id]["description"];
  var room        = jsonContent[id]["room"];

    res.render('pages/index', {
        name: name,
        location : location,
        type: type,
        time : time,
        description: description,
        room : room,
        invitee: invitee
    });
});

// about page 
app.get('/', function(req, res) {
	res.render('pages/about');
});

app.use(express.static(__dirname + '/stylesheet'));

app.listen(8080);
console.log('8080 is the magic port');