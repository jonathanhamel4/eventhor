// load the things we need
var express = require('express');
var app = express();

// set the view engine to ejs
app.set('view engine', 'ejs');

// use res.render to load up an ejs view file

// index page 
app.get('/event/:id', function(req, res) {
  var fs = require("fs");
  var contents = fs.readFileSync("events.json");
   var jsonContent = JSON.parse(contents);
   var id = req.params.id;
     var tagline = jsonContent[id]["name"];
     var admin = jsonContent[id]["owner"];
     var desc = jsonContent[id]["description"];
     var location = jsonContent[id]["location"];
    req.param.id = jsonContent[id]["id"];
     res.render('pages/admin', {
        drinks: jsonContent,
        tagline: tagline,
        admin: admin,
        desc: desc,
        location: location
    })
});

app.get('/event/:id/invite/:invitee', function(req, res) {
     var fs = require("fs");
  var contents = fs.readFileSync("events.json");
  var jsonContent = JSON.parse(contents);
  var id = req.params.id;
  var invitee = jsonContent[id]["user"];  
  var name = jsonContent[id]["name"];
  var location = jsonContent[id]["location"];
  var type = jsonContent[id]["type"];
  var time = jsonContent[id]["time"];
  var description = jsonContent[id]["description"];
   var room = jsonContent[id]["room"];
   var admin = jsonContent[id]["owner"];
  req.param.id = jsonContent[id]["id"];
    res.render('pages/index', {
        name: name,
        location : location,
        type: type,
        time : time,
        description: description,
        room : room,
        invitee: invitee,
        admin:admin
    })
});

// about page 
app.get('/', function(req, res) {
	res.render('pages/about');
});

app.use(express.static(__dirname + '/stylesheet'));

app.listen(8080);
console.log('8080 is the magic port');