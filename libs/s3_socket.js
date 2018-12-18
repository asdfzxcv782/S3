'use strict'; //use es6
var ss = require('socket.io-stream');
var fs = require("fs");
var s3_function = require('./s3_function.js');
var CFlib = require('./cf-lib.js');
var ACMlib = require('./acm-lib.js');

function s3Socket(sio, local, systemOption){

    this.io = sio;
    this.local = local;
    this.systemOption = systemOption;

    this.online = 0;

    this.filedata=[];
    this.fileCount = 0;
    this.MaxFile = 0;
    this.file_path='';

    this.s3 = new s3_function();
    this.cf = new CFlib();
    this.acm = new ACMlib();

    this.acm.listCertificates(function(data, err){
        if(err){
            console.log(err);
        }else{
            this.acmARN = data;
            // console.log(this.acmARN);
        }
    }.bind(this));

    this.cf.getOAI(function(data, err){
        if(err){
            console.log(err);
        }else{
            this.cfOAI = data;
            // console.log(this.cfOAI);
        }
    }.bind(this));

    this.s3.getAllBucket(function(data){
        this.allbucket = data;

        for (let i = 0; i < data.length; i++) {
            this.initChat(data[i]);
        }
    }.bind(this));

    this.server = this.io.of('/server').on('connection', this.socketHandler.bind(this));
}

s3Socket.prototype.socketHandler = function(socket){
    this.systemOption.logs({ status:"User", msg:"connected" });
    this.online++;
    this.server.emit('online', { online: this.online });

    socket.emit('get_buckets_list', { get_buckets_list:this.allbucket });

    socket.on('setBucketName', function(data){
        this.s3.get_game_file_list(data.setBucketName, function(data){
            socket.emit('get_list', { get_list: data });
        });
    }.bind(this));

    socket.on('add_bucket', this.addBucket.bind(this, socket));

    socket.on('disconnect', this.disconnect.bind(this));
};

s3Socket.prototype.initChat = function (bucketName) {
    let chat = this.io.of('/'+bucketName).on('connection', function(socket){

        this.systemOption.logs({ status:"User", msg:"connected Bucket:"+ bucketName });

        socket.on('upload_file_data', this.uploadFileData.bind(this, socket));

        ss(socket).on('upload_file', this.uploadFileStream.bind(this, bucketName, chat, socket));

        socket.on('get_file_info', this.getFileInfo.bind(this, bucketName, socket));

        socket.on('add_folder', this.addFolder.bind(this, bucketName, chat, socket));

        socket.on('del_file', this.delFile.bind(this, bucketName, chat, socket));

        socket.on('disconnect', function(){
            this.systemOption.logs({ status:"User", msg:"disconnected Bucket:"+ bucketName });
        }.bind(this));

    }.bind(this));
};

s3Socket.prototype.uploadFileData = function(socket, msg){

    this.fileCount = 0; //重置
    let fileCount = this.fileCount;

    this.MaxFile = msg.filedata.length;
    this.filedata = msg.filedata;
    this.file_path = msg.file_path;

    socket.emit('even_file_upload', { fileCount });
};

s3Socket.prototype.uploadFileStream = function(bucket, chat, socket, stream){

    let n = Date.now();
    let x = Math.floor((Math.random() * 1000000) + 1);

    let type = this.filedata[this.fileCount].split(".")[1];
    let tmpFileName = n+x+'.'+type;

    var file_stream =stream.pipe(fs.createWriteStream(this.local+'/tmp/'+tmpFileName,{flags: 'a',encoding: 'utf8'}));
    // var file_stream =stream.pipe(fs.createWriteStream(this.local+'/tmp/'+this.filedata[this.fileCount],{flags: 'a',encoding: 'utf8'}));

    file_stream.on('close',function(){

        var file_data_tmp_path = this.local+'/tmp/'+tmpFileName;

        // var file_data_tmp_path = this.local+'/tmp/'+this.filedata[this.fileCount];

        var body = fs.createReadStream(file_data_tmp_path);

        console.log(this.file_path[this.fileCount], this.filedata[this.fileCount]);

        this.s3.upload_gmae_file(bucket,(this.file_path[this.fileCount] + this.filedata[this.fileCount]),body,function(even, err){
            if(err){
                socket.emit('err', { errCode: err });
            }
            if(even){
                fs.unlink(file_data_tmp_path, (err)=>{
                    if (err) throw err;
                    console.log('del tmp file : ' + file_data_tmp_path);
                });
            }

            this.s3.get_game_file_list(bucket, function(data){
                chat.emit('get_list', { get_list: data });
            });

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

s3Socket.prototype.addBucket = function (socket, msg) {

    // this.cf.creatCF(msg.add_bucket, this.cfOAI, this.acmARN, (err, data) => {
    //     if(data){
    //         console.log(data);
    //         //console.log(data.Distribution.Status);
    //     }else{
    //         console.log(err);
    //         //socket.emit('err', { errCode: err });
    //     }
    // });

    this.s3.createBucket(msg.add_bucket, (data, err) => {
        if(data){

            this.systemOption.logs({ status:"Add Bucket", msg:"Add " + msg.add_bucket + '!' });

            this.initChat(msg.add_bucket);

            // this.cf.creatCF(msg.add_bucket, this.cfOAI, this.acmARN, (err, data) => {
            //     if(data){
            //         console.log(data);
            //         console.log(data.Distribution.Status);
            //     }else{
            //         socket.emit('err', { errCode: err });
            //     }
            // });

            this.s3.getAllBucket((data)=>{
                this.allbucket = data;
            });
        }else{
            socket.emit('err', { errCode: err });
        }
    });
};

s3Socket.prototype.getFileInfo = function(bucket, socket, msg){
    this.s3.get_file_info(bucket, msg.get_file_info, function(data){
        socket.emit('even_file_info', data);
    }.bind(this));
};

s3Socket.prototype.addFolder = function(bucket, chat, socket, msg){
    this.s3.add_folder(bucket, msg.add_folder, function(data, err){
        if(data){
            this.s3.get_game_file_list(bucket, function(data){
                chat.emit('get_list', { get_list: data });
            });
        }else{
            socket.emit('err', { errCode: err });
        }
    }.bind(this));
};

s3Socket.prototype.delFile = function(bucket, chat, socket, msg){
    this.s3.del_file(bucket, msg.del_file,function(data, err){
        if(data){
            this.s3.get_game_file_list(bucket, function(data){
                chat.emit('get_list', { get_list: data });
            });
        }else{
            socket.emit('err', { errCode: err });
        }
    }.bind(this));
};

s3Socket.prototype.disconnect = function(){
    this.systemOption.logs({ status:"User", msg:"disconnected" });
    this.online--;
    this.server.emit('online', { online: this.online });
};

module.exports = s3Socket;
