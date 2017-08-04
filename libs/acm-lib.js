'use strict'; //use es6

var AWS = require('aws-sdk');
var aws_key = require('../config/aws_key.js');

function ACMlib(){

    this.acm = new AWS.ACM({
        apiVersion: '2015-12-08',
        region: aws_key.aws_ec2_s3_region,
        accessKeyId: aws_key.aws_ec2_s3_access,
        secretAccessKey: aws_key.aws_ec2_s3_passwd
    });
}

ACMlib.prototype.listCertificates = function (callback) {
    var params = {};
    this.acm.listCertificates(params, function(err, data) {
        if (err) {
            callback(false, err.code);
        }else{
            callback(data, null);
        }
    });
};

module.exports = ACMlib;
