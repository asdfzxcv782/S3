'use strict'; //use es6

var AWS = require('aws-sdk');
var aws_key = require('../config/aws_key.js');

function CFlib(){

    this.cloudfront = new AWS.CloudFront({
        apiVersion: '2017-03-25',
        accessKeyId: aws_key.aws_ec2_s3_access,
        secretAccessKey: aws_key.aws_ec2_s3_passwd
    });

}

/**
 * GetOAI - cloudfront
 * @param  {Function} callback callback
 */
CFlib.prototype.getOAI = function (callback) {
    let params = {
        Marker: ''
    };
    this.cloudfront.listCloudFrontOriginAccessIdentities(params, function(err, data) {
        if (err) {
            callback(false, err.code);
        }else{
            callback(data, null);
        }
    });
};

CFlib.prototype.creatCF = function (bucketName, oaiID, acmARN, callback) {
    var params = {
        DistributionConfig: {
        CallerReference: '',
        Comment: '',
        DefaultCacheBehavior: {
          MinTTL: 0,
          ViewerProtocolPolicy: 'redirect-to-https',
          AllowedMethods: {
            Items: ['GET', 'HEAD'],
            Quantity: 0,
            CachedMethods: {
              Items: ['GET', 'HEAD'],
              Quantity: 0
            }
          },
          Compress: false,
          DefaultTTL: 86400,
          MaxTTL: 31536000,
          SmoothStreaming: false
        },
        Enabled: true,
        Origins: {
          Quantity: 0,
          Items: [
            {
              DomainName: bucketName + '.s3.amazonaws.com',
              Id: 'S3-' + bucketName,
              S3OriginConfig: {
                OriginAccessIdentity: 'origin-access-identity/CloudFront/' + oaiID.CloudFrontOriginAccessIdentityList.Items[0].Id
              }
            },
          ]
        },
        CacheBehaviors: {
          Quantity: 0,
          Items: [
            {
              MinTTL: 0,
              PathPattern: '*',
              ViewerProtocolPolicy: 'redirect-to-https',
              AllowedMethods: {
                Items: ['GET' , 'HEAD'],
                Quantity: 0,
                CachedMethods: {
                  Items: ['GET' , 'HEAD'],
                  Quantity: 0
                }
              },
              Compress: false,
              DefaultTTL: 86400,
              MaxTTL: 31536000,
              SmoothStreaming: false
            },
          ]
        },
        HttpVersion: 'http2',
        IsIPV6Enabled: true,
        PriceClass: 'PriceClass_All',
        ViewerCertificate: {
          ACMCertificateArn: acmARN.CertificateSummaryList[0].CertificateArn,
          CloudFrontDefaultCertificate: false,
          MinimumProtocolVersion: 'SSLv3',
          SSLSupportMethod: 'sni-only'
        },
      }
    };
    this.cloudfront.createDistribution(params, function(err, data) {
        if (err) {
            console.log(err);
            callback(false, err.code);
        }else{
            callback(data, null);
        }
    });
};

module.exports = CFlib;
