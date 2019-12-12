// @ts-check
'use strict'; //use es6

var AWS = require('aws-sdk');
var aws_key = require('../config/aws_key.js');
const redis = require('redis');
const client = redis.createClient();

function s3_function(){

    this.s3client = new AWS.S3({
        accessKeyId: aws_key.aws_ec2_s3_access,
        secretAccessKey: aws_key.aws_ec2_s3_passwd
    });
    

}


/**
 * getAllBuckets Name
 */
s3_function.prototype.getAllBucket = function (callback) {
    this.s3client.listBuckets(function(err, data) {
        if (err){
            console.log("Error:", err);
        }else{
            let bucket_list = [];

            for (let index=0; index<data.Buckets.length; index++) {
                bucket_list.push(data.Buckets[index].Name);
            }
            callback(bucket_list);
            // this.sio.emit('get_buckets_list', { get_buckets_list: bucket_list });
        }
    }.bind(this));
};

/**
 * createBucket
 * @param  {string}   bucketName bucketName
 * @param  {Function} callback   callback
 */
s3_function.prototype.createBucket = function (bucketName, callback) {

    let params = {
        Bucket: bucketName, /* required */
        ACL: 'public-read',
        CreateBucketConfiguration: {
            LocationConstraint: 'ap-southeast-1'
        },
        // GrantFullControl: 'STRING_VALUE',
        // GrantRead: 'STRING_VALUE',
        // GrantReadACP: 'STRING_VALUE',
        // GrantWrite: 'STRING_VALUE',
        // GrantWriteACP: 'STRING_VALUE'
    };

    this.s3client.createBucket(params, function(err, data) {
        if (err) {
            //console.log("Error:", err.code);
            callback(false, err.code);
        }else {
            this.addBucketCros(bucketName);
            callback(true, null);
        }
    }.bind(this));
};

// <CORSConfiguration>
// <CORSRule>
//     <AllowedOrigin>*</AllowedOrigin>
//     <AllowedMethod>GET</AllowedMethod>
//     <MaxAgeSeconds>3000</MaxAgeSeconds>
//     <AllowedHeader>Authorization</AllowedHeader>
// </CORSRule>
// </CORSConfiguration>

/**
 * addBucketCros
 * @param {string} bucketName bucketName
 */
s3_function.prototype.addBucketCros = function (bucketName) {
    var params = {
        Bucket: bucketName, /* required */
        CORSConfiguration: { /* required */
        CORSRules: [{
            AllowedMethods: [
                'GET',
            ],
            AllowedOrigins: [
                '*',
            ],
            AllowedHeaders: [
                'Authorization',
            ],
            // ExposeHeaders: [
            //     'STRING_VALUE',
            //     /* more items */
            // ],
            MaxAgeSeconds: 3000
        },
        ]},
        // ContentMD5: 'STRING_VALUE'
    };
    this.s3client.putBucketCors(params, function(err, data) {
        if(err){
            console.log(err, err.code); // an error occurred
        }
    });
};

/**
 * game_list css & pic file
 * @param {string} bucket aws_s3
 */
s3_function.prototype.get_game_file_list = function(bucket,needUpdate,callback){
    //params.Marker = marker
    client.get(`${bucket}`, (error, result) => {
        if (error) {
          console.log(error);
          throw error;
        }else if(result === null || needUpdate === true || bucket === 'ushows3atsg'){
            var params = {
                Bucket:bucket,        //required
                Marker: ''
            };
            var all_list = {};
            var folder_list = [];
            //this.s3client.listObjectsV2(params, function(err,data){
            this.s3 = () => {
                this.s3client.listObjects(params, function (err,data){
                    if (err) {
                        console.log("Error:", err);
                        callback(err);
                    }else {
                        console.log(data);
                        //var folder_list = [];
                        if(data.IsTruncated){
                            for (var index=0; index<data.Contents.length; index++) {
                                var s3 = data.Contents[index];
                                all_list[s3.Key] = s3;
                                folder_list.push(s3.Key);
                            }
                            params.Marker = data.Contents[data.Contents.length-1].Key
                            this.s3();
                            /*this.s3client.listObjects(params, function (err,data){
                                for (var index=0; index<data.Contents.length; index++) {
                                    var s3 = data.Contents[index];
                                    folder_list.push(s3.Key);
                                }
                                console.log(folder_list)
                                this.s3();
                            })*/
                        }else{
                            for (var index=0; index<data.Contents.length; index++) {
                                var s3 = data.Contents[index];
                                all_list[s3.Key] = s3;
                                folder_list.push(s3.Key);
                            }
                            console.log(folder_list);
                            callback(folder_list);
                            client.set(`${bucket}`, JSON.stringify(folder_list), redis.print);//給 get_game_file_list 用
                            client.set(`all_${bucket}`, JSON.stringify(all_list), redis.print);//給 get_file_info 用
                        }
                        // this.sio.emit('get_list', { get_list: folder_list });
                    }
                    
                }.bind(this));
            }
            this.s3();
        }else{
            //console.log('GET result ->' + result);
            console.log('read in cache')
            callback(JSON.parse(result));
        }
        
        
    });
};

s3_function.prototype.get_file_info = function(bucket,file_path, callback){
    //const redis_path = 
    client.get(`all_${bucket}`, (error, result) => {
        if (error) {
          console.log(error);
          throw error;
        }else{
            //console.log(result);
            if(file_path === ''){
                console.log('get_bucketself')
            }else{
                const data1 = JSON.parse(result);
                callback({
                    file_name:data1[file_path].Key,
                    file_size: data1[file_path].Size,
                    file_LastModified:data1[file_path].LastModified,
                    file_public_s3:'https://s3-ap-southeast-1.amazonaws.com/'+ bucket +'/'+data1[file_path].Key,
                    file_public_cdn:'https://cdn' + bucket.replace("game", "") + '.u-show777.online/' + data1[file_path].Key
                });
            }
        }
    });
    /*var params = {
        Bucket:bucket,        //required
        Prefix:file_path
    };
    this.s3client.listObjects(params, function(err,data){
        
        if (err) {
            console.log("Error:", err);
        }else {
            if(data.Contents.length){
                callback({
                    file_name:data.Contents[0].Key,
                    file_size: data.Contents[0].Size,
                    file_LastModified:data.Contents[0].LastModified,
                    file_public_s3:'https://s3-ap-southeast-1.amazonaws.com/'+ bucket +'/'+data.Contents[0].Key,
                    file_public_cdn:'https://cdn' + bucket.replace("game", "") + '.u-show777.online/' + data.Contents[0].Key
                });
                // this.sio.emit('even_file_info', {
                //     file_name:data.Contents[0].Key,
                //     file_size: data.Contents[0].Size,
                //     file_LastModified:data.Contents[0].LastModified,
                //     file_public_url:'https://s3-ap-southeast-1.amazonaws.com/'+ bucket +'/'+data.Contents[0].Key
                // });
            }
        }
    }.bind(this));*/
};

/**
 * add aws folder
 * @param {string} bucket      aws_bucket_name
 * @param {string} folder_path add_folder_path
 * @param {boolean} callback    finish_boolean
 */
s3_function.prototype.add_folder = function(bucket,folder_path,callback){
    var params = {
      Bucket: bucket, /* required */
      Key: folder_path, /* required */
    };
    this.s3client.putObject(params, function(err, data) {
      if (err){
          callback(false, err.code);
        // console.log(err, err.stack); // an error occurred
      }else{
          callback(true, null);           // successful response
      }
    }.bind(this));
};
/**
 * del aws folder
 * @param {string} bucket    aws_bucket_name
 * @param {string} file_name del_file_path
 * @param {boolean} callback  finish_boolean
 */
s3_function.prototype.del_file = function(bucket,file_name,callback){
    //console.log(file_name)

    var params = {
        Bucket: bucket,
        Prefix: file_name
    };

    this.s3client.listObjects(params, function(err, data) {
        if (err){
            console.log(err, err.stack); // an error occurred
        }

        params = {Bucket: bucket};
        params.Delete = {Objects:[]};

        data.Contents.forEach(function(content) {
            params.Delete.Objects.push({Key: content.Key});
        });

        this.s3client.deleteObjects(params, function(err, data) {
            if (err){
                // console.log(err, err.stack); // an error occurred
                callback(false, err.code);
            }else{
                //console.log('del file '+ file_name);           // successful response
                callback(true);
            }
        }.bind(this));
    }.bind(this));
};

/**
 * upload_game_file
 * @param {string} bucket       aws_bucket_name
 * @param {string} file_name    upload_file_name
 * @param {stream} streamObject socket_stream_file
 * @param {boolean} callback     finish_boolean
 */
s3_function.prototype.upload_gmae_file = function(bucket,file_name,streamObject,callback){
    var params = {
      Bucket: bucket, /* required */
      Key: file_name, /* required */
      ACL: 'public-read',
      Body: streamObject
    };
    const last = arr => arr[arr.length - 1];

    let file_type = last(file_name.split('.'));
    console.log(last(file_name.split('.')));

    switch (file_type.toLowerCase()) {
      case 'png':
          params.ContentType = 'image/png';
      break;
      case 'css':
          params.ContentType = 'text/css';
      break;
      case 'html':
          params.ContentType = 'text/html';
      break;
      case 'gif':
          params.ContentType = 'image/gif';
      break;
      case 'js':
          //params.ContentType = 'text/css';
      break;
      case 'json':
          params.ContentType = 'application/json';
      break;
      case 'ttf':
          params.ContentType = 'application/x-font-ttf';
      break;
      case 'woff':
          params.ContentType = 'application/font-woff';
      break;
      case 'woff2':
          params.ContentType = 'application/font-woff2';
      break;
      case 'otf':
          params.ContentType = 'application/x-font-opentype';
      break;
      case 'eot':
          params.ContentType = 'application/vnd.ms-fontobject';
      break;
    }

    this.s3client.putObject(params, function(err, data) {
      if (err){
        // console.log(err, err.stack); // an error occurred
        callback(true, err.code);           // successful response
      }else{
        callback(true, null);           // successful response
      }
    }.bind(this));
};

/**
 * s3_log_reader use
 * @param {string} bucket aws_s3
 * @param {string} prefix local
 */
s3_function.prototype.get_file_list = function(bucket,prefix, callback){

    var params = {
        Bucket:bucket,        //required
        Prefix:prefix            //required
    };

    this.s3client.listObjects(params, function(err,data){
        if (err) {
            console.log("Error:", err);
        }else {
            console.log(data);
            var folder_list = {};
            var tmp_array =[];
            
            for (var index in data.Contents) {

                var s3 = data.Contents[index];

                if(s3.Size > 0){

                    var tmp = s3.Key.split('/');

                    if(typeof(folder_list[tmp[tmp.length-2]])!=='object'){
                        folder_list[tmp[tmp.length-2]] = {list: []};
                    }

                    folder_list[tmp[tmp.length-2]].list.push(s3.Key);
                }

            }
            console.log(folder_list);
            callback(folder_list);
            //this.sio.emit('get_list', { get_list: JSON.stringify(folder_list) });
        }
    }.bind(this));

};

module.exports = s3_function;
