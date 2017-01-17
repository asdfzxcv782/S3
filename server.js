'use strict'; //use es6
var nunjucks = require('nunjucks');
var express = require('express');
var bodyParser = require('body-parser');
var auth = require('basic-auth');
var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);

var SystemOption = require("./libs/system.js");
var s3Socket = require('./libs/s3_socket.js');
//var s3_function = require('./libs/s3_function.js');

var fs = require("fs");

var option = {
    server_type:'S3',
    webPort:9697
};

var systemOption = new SystemOption(option, http);

nunjucks.configure(__dirname + '/views', { //模板引擎設定
    autoescape: true,
    express: app
});

app.use(express.static(__dirname + '/public')); //靜態檔案處理

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// BasicAuth login
app.use(function(req, res, next) {
    var user = auth(req);
    if (user === undefined || user['name'] !== 'ushow' || user['pass'] !== 'vshow2351700') {
        res.statusCode = 401;
        res.setHeader('WWW-Authenticate', 'Basic realm=Authorization Required');
        res.json({
            login:false
        });
        res.end();
    } else {
        next();
    }
});

app.get('/', function (req, res){
  res.render('aws_s3_upload_file.html', {
    title : 'Aws-S3-Upload-File',
    head : 'Aws-S3 Upload File',
    socketPort : option.webPort
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error.html', {
    message: err.message,
    error: err
  });
});

var s3Socket = new s3Socket(io, __dirname, systemOption);
