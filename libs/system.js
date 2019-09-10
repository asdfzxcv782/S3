'use strict'; //use es6
function SystemOption(option, http){
    this.option = option;
    this.http = http;

    this.http.listen(this.option.webPort, function(){
        this.logs({
            status:this.option.server_type+" Server Port", //node server.js --> S3 + "Server Port" server.js -->server_type
            msg:this.option.webPort //9697
        });
    }.bind(this));
}

SystemOption.prototype.init = function(){

};

SystemOption.prototype.logs = function(obj){
    console.log(new Date().toLocaleString() + " ["+ obj.status +"] "+ obj.msg); //2019-3-25 13:15:22 [S3 Server Port] 9697
};

module.exports = SystemOption;
