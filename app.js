var express = require("express");
var app = express();
global.__basedir = __dirname;


var bodyParser = require('body-parser')
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

var controller = require(__dirname  + "/apps/controllers");
app.use(controller);


app.set("views",__dirname + "/apps/views");
app.set("view engine", "ejs");
app.use("/static", express.static(__dirname + "/public"));


var server = app.listen(3000, function(){
   console.log("server is running");
});
