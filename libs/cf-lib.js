'use strict'; //use es6

var AWS = require('aws-sdk');
var aws_key = require('../config/aws_key.js');
var cf_bucket = require('../config/cf_bucket.js');

function CFlib(){

    this.cloudfront = new AWS.CloudFront({
        apiVersion: '2017-03-25',
        accessKeyId: aws_key.aws_ec2_s3_access,
        secretAccessKey: aws_key.aws_ec2_s3_passwd
    });

    
    
}
/**
 * listInvalidation列出失效 - cloudfront
 * @param  {Function} callback callback
 */
CFlib.prototype.listInvalidations = function (bucket,callback) {
  let bucket_Id = cf_bucket[`${bucket}`]
  let params = {
    DistributionId: `${bucket_Id}`, 
    Marker: '',
    MaxItems: '10',
  };
  this.cloudfront.listInvalidations(params, function(err, data) {
      if (err) {
        callback(false,'',err.code);
      }
      else if(data.InvalidationList.IsTruncated === false){

        callback(false,'','沒有失效可查詢')
      }else{
        for(let i=0;i<5;i++){
          this.getInvalidation(data.Items[i].Id, bucket_Id,callback,bucket); 
        };   
      };
        //this.getInvalidation(data.Items[0].Id, bucket_Id,callback,bucket); 
      
  }.bind(this));
};

CFlib.prototype.getInvalidation =function (data,bucket_Id,callback,bucket) {
  console.log(data)
  let params = {
    DistributionId: `${bucket_Id}`, 
    Id:data
  };
  this.cloudfront.getInvalidation(params, function(err, data) {
      if (err) {
          callback(false, err.code);
      }else{
          callback(true,data,'',bucket);//callback給listInvalidations指定的callback
          console.log(data);
      }
  }.bind(this));
}; 
/**
 * createInvalidation新增失效 - cloudfront
 * @param  {Function} callback callback
 */
CFlib.prototype.createInvalidation =  function(bucket,file_name,callback) {
  console.log(file_name.indexOf('.'))
  let bucket_Id = cf_bucket[`${bucket}`]
  let dateTime = Date.now();
  let timestamp = Math.floor(dateTime / 1000);
  if(file_name.indexOf('.') === -1){
    var params = {
      DistributionId: bucket_Id, 
      InvalidationBatch: { 
        CallerReference: `${timestamp}`, 
        Paths: { 
          Quantity: 1, 
          Items: [
            '/'+`${file_name}`+'*',
            
          ]
        }
      }
    };
  }else{
  var params = {
    DistributionId: bucket_Id, 
    InvalidationBatch: { 
      CallerReference: `${timestamp}`, 
      Paths: { 
        Quantity: 1, 
        Items: [
          '/'+`${file_name}`,
          
        ]
      }
    }
  };}
  this.cloudfront.createInvalidation(params, function(err, data) {
    if (err) {
      console.log(err.code)
      callback(false,'', err.code);
    }
     // an error occurred
    else{ 
      callback(true,data);    
      console.log(data); 
    }

  }.bind(this))  
};
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
