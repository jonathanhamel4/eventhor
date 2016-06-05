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
	var admin = jsonContent[0]["owner"];
    var tagline = jsonContent[0]["name"];
    req.params.id = jsonContent[0]["id"];
    res.render('pages/admin', {
        drinks: jsonContent,
        tagline: tagline,
        admin: admin
    });
    

});

app.get('/event/:Name/invite/:user', function(req, res) {
  var fs = require("fs");
  var contents = fs.readFileSync("events.json");
  var jsonContent = JSON.parse(contents);
  
    var tagline = jsonContent[0]["Name"];

    res.render('pages/index', {
        drinks: jsonContent,
        tagline: tagline
    });
});

// about page 
app.get('/', function(req, res) {
	res.render('pages/about');
});

app.use(express.static(__dirname + '/stylesheet'));

app.listen(8080);
console.log('8080 is the magic port');