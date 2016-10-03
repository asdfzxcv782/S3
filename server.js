var nunjucks = require('nunjucks');
var express = require('express');
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

var s3Socket = new s3Socket(io,systemOption);

//var online = 0;
//
//var filedata=[], fileCount = 0, MaxFile = 0 , file_path='';
//
//io.on('connection', function(socket){ //io 廣播用 socket 私密用
//    
//    console.log('a user connected *:9696');
//    
//    online++;
//    
//    io.emit('online', { online: online });
//    
//    var s3 = new s3_function(socket);
//    
//    s3.get_game_file_list('ushowgamefile');
//        
//    socket.on('upload_file_data',function(msg){
//        
//        fileCount = 0; //重置
//        
//        MaxFile = msg.filedata.length;
//        filedata = msg.filedata;
//        file_path = msg.file_path;
//        
//        socket.emit('even_file_upload', { fileCount });
//        
//    });
//    
//    ss(socket).on('upload_file', function(stream) {
//        
//        var file_stream =stream.pipe(fs.createWriteStream('./tmp/'+filedata[fileCount],{flags: 'a',encoding: 'utf8'}));
//                
//        file_stream.on('close',function(){
//            
//            var file_data_tmp_path = './tmp/'+filedata[fileCount];
//            
//            var body = fs.createReadStream(file_data_tmp_path);
//            
//            s3.upload_gmae_file('ushowgamefile',(file_path + filedata[fileCount]),body,function(even){
//                if(even){
//                    fs.unlink(file_data_tmp_path);
//                    console.log('del tmp file : ' + file_data_tmp_path);
//                }
//                
//                s3.get_game_file_list('ushowgamefile');
//                
//            }.bind(this));
//            
//            body.on('close',function(){
//                
//                fileCount++;
//            
//                if(fileCount < MaxFile){
//                    console.log(filedata[(fileCount-1)]+' end!')
//                    socket.emit('even_file_upload', { fileCount });
//                }else{
//                    console.log(filedata[(fileCount-1)]+' end!')
//                    console.log('file stream end!')
//                    socket.emit('even_file_end', { });
//                }
//                
//            });
//            
//            
//            
//        });
//        
//    });
//    
//    socket.on('get_file_info',function(msg){
//        s3.get_file_info('ushowgamefile',msg.get_file_info);
//    });
//    
//    socket.on('add_folder',function(msg){
//        s3.add_folder('ushowgamefile',msg.add_folder,function(data){
//            if(data){
//                s3.get_game_file_list('ushowgamefile');
//            }
//        });
//    });
//    
//    socket.on('del_file',function(msg){
//        s3.del_file('ushowgamefile',msg.del_file,function(data){
//            if(data){
//                s3.get_game_file_list('ushowgamefile');
//            }
//        }.bind(this));
//    });
//        
//    socket.on('disconnect', function(){
//        
//        console.log('user disconnected *:3004');
//        
//        online--;
//        
//        io.emit('online', { online: online });
//        
//    });
//    
//});