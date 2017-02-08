'use strict'; //use es6
var ss = require('socket.io-stream');
var fs = require("fs");
var s3_function = require('./s3_function.js');

function s3Socket(sio, local, systemOption){

    this.io = sio;
    this.local = local;
    this.systemOption = systemOption;

    this.online = 0;

    this.filedata=[];
    this.fileCount = 0;
    this.MaxFile = 0;
    this.file_path='';

    this.server = this.io.on('connection', this.socketHandler.bind(this));
}

s3Socket.prototype.socketHandler = function(socket){
    this.systemOption.logs({ status:"User", msg:"connected" });
    this.online++;
    this.server.emit('online', { online: this.online });

    this.s3 = new s3_function(socket);

    this.s3.getAllBucket();

    socket.on('setBucketName', function(data){
        this.bucketName = data.setBucketName;
        this.s3.get_game_file_list(data.setBucketName);
    }.bind(this));

    socket.on('upload_file_data', this.uploadFileData.bind(this, socket));

    ss(socket).on('upload_file', this.uploadFileStream.bind(this, socket));

    socket.on('get_file_info', this.getFileInfo.bind(this));

    socket.on('add_folder', this.addFolder.bind(this));

    socket.on('del_file', this.delFile.bind(this));

    socket.on('disconnect', this.disconnect.bind(this));
};

s3Socket.prototype.uploadFileData = function(socket, msg){

    this.fileCount = 0; //重置
    let fileCount = this.fileCount;

    this.MaxFile = msg.filedata.length;
    this.filedata = msg.filedata;
    this.file_path = msg.file_path;

    socket.emit('even_file_upload', { fileCount });
};

s3Socket.prototype.uploadFileStream = function(socket, stream){

    var file_stream =stream.pipe(fs.createWriteStream(this.local+'/tmp/'+this.filedata[this.fileCount],{flags: 'a',encoding: 'utf8'}));

    file_stream.on('close',function(){

        var file_data_tmp_path = this.local+'/tmp/'+this.filedata[this.fileCount];

        var body = fs.createReadStream(file_data_tmp_path);

        this.s3.upload_gmae_file(this.bucketName,(this.file_path + this.filedata[this.fileCount]),body,function(even){
            if(even){
                fs.unlink(file_data_tmp_path);
                console.log('del tmp file : ' + file_data_tmp_path);
            }

            this.s3.get_game_file_list(this.bucketName);

        }.bind(this));

        body.on('close',function(){

            this.fileCount++;

            if(this.fileCount < this.MaxFile){
                console.log(this.filedata[(this.fileCount-1)]+' end!');
                let fileCount = this.fileCount;
                socket.emit('even_file_upload', { fileCount });
            }else{
                console.log(this.filedata[(this.fileCount-1)]+' end!');
                console.log('file stream end!');
                socket.emit('even_file_end', { });
            }

        }.bind(this));

    }.bind(this));
};

s3Socket.prototype.getFileInfo = function(msg){
    this.s3.get_file_info(this.bucketName, msg.get_file_info);
};

s3Socket.prototype.addFolder = function(msg){
    this.s3.add_folder(this.bucketName, msg.add_folder,function(data){
        if(data){
            this.s3.get_game_file_list(this.bucketName);
        }
    }.bind(this));
};

s3Socket.prototype.delFile = function(msg){
    this.s3.del_file(this.bucketName, msg.del_file,function(data){
        if(data){
            this.s3.get_game_file_list(this.bucketName);
        }
    }.bind(this));
};

s3Socket.prototype.disconnect = function(){
    this.systemOption.logs({ status:"User", msg:"disconnected" });
    this.online--;
    this.server.emit('online', { online: this.online });
};

module.exports = s3Socket;
