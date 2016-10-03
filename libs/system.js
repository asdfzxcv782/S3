function SystemOption(option, http){
    this.option = option;
    this.http = http;
    
    this.http.listen(this.option.webPort, function(){
        this.logs({
            status:this.option.server_type+" Server Port",
            msg:this.option.webPort 
        });
    }.bind(this));
}

SystemOption.prototype.init = function(){
    
}

SystemOption.prototype.logs = function(obj){
    console.log(new Date().toLocaleString() + " ["+ obj.status +"] "+ obj.msg);
}

module.exports = SystemOption;