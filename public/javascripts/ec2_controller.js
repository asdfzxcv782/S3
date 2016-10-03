/**
 * Init socket IO
 * @param {socket} - socket Nodejs socket
 */
function ec2_socket(socket){
    
    this.socket = socket;
    
    this.socket.on('online', function(data){
        document.getElementById('online').innerHTML = data.online;
    });
    
}

/**
 * Add console on html(title)
 * @param {string} - title set title
 */
function ec2_console(title){
    
        var now_time = new Date();

        var time_txt = now_time.getFullYear()+'-'+(now_time.getDate()+1)+'-'+now_time.getDay()+' '+now_time.getHours()+':'+now_time.getMinutes()+':'+now_time.getSeconds();

        var html_console ='';
    
        html_console += '================== '+title+' '+time_txt+' ==================\n';
        
        document.getElementById('console-text').innerHTML += html_console;
    
        var context_sh = document.getElementById('console-text').scrollHeight;//取得高度

        document.getElementById('console-text').scrollTop = context_sh; //至底
}

/**
 * Add console on html(content)
 * @param {string} - html set content
 */
function ec2_console_content(html){
    
        var now_time = new Date();

        var time_txt = now_time.getFullYear()+'-'+(now_time.getDate()+1)+'-'+now_time.getDay()+' '+now_time.getHours()+':'+now_time.getMinutes()+':'+now_time.getSeconds();

        document.getElementById('console-text').innerHTML += (time_txt+' '+html+'\n');

        var context_sh = document.getElementById('console-text').scrollHeight;//取得高度

        document.getElementById('console-text').scrollTop = context_sh; //至底
}

/**
 * Get AWS EC2 Instances
 * running or stopped
 */
ec2_socket.prototype.get_ec2_info = function(){
           
        this.socket.emit('get_ec2_info', {});
        
        this.socket.once('get_ec2_info', function(data){
            
        if(data.get_ec2_info_server.length){

            var html_running='';
            var html_stopped='';
            var html_padding='';

            var running_count = 1;
            var stopped_count = 1;

            for(var key in data.get_ec2_info_server){
                for(var key1 in data.get_ec2_info_server[key].Instances){

                    var ec2_status = data.get_ec2_info_server[key].Instances[key1].State.Name;

                    var ec2_id = data.get_ec2_info_server[key].Instances[key1].InstanceId;

                    if(data.get_ec2_info_server[key].Instances[key1].Tags.length >0){
                        var ec2_name = data.get_ec2_info_server[key].Instances[key1].Tags[0].Value;
                    }

                    var ec2_InstanceType = data.get_ec2_info_server[key].Instances[key1].InstanceType;
                    var ec2_Public_DNS = data.get_ec2_info_server[key].Instances[key1].PublicDnsName;

                    if(data.get_ec2_info_server[key].Instances[key1].SecurityGroups.length >0){
                        var ec2_SecurityGroups = data.get_ec2_info_server[key].Instances[key1].SecurityGroups[0].GroupId;
                    }


                    switch(ec2_status){
                        case 'running':

                            html_running +='<tr>';
                            html_running +='    <td>'+running_count+'</td>';
                            
                            html_running +='    <td>';
                            html_running +='        <div class="wgt-center-hw">';
                            html_running +='            <div class="wgt-tooltip">';
                            html_running +='                <div class="tip-area">';
                            html_running +='                    <div class="tooltiptext ani-opacity ani-scale" wgt-tip="';
                            html_running +='                        EC2-Name : '+ec2_name+'&#xa;';
                            html_running +='                        EC2-InstanceType : '+ec2_InstanceType+'&#xa;';
                            html_running +='                        EC2-SecurityGroups : '+ec2_SecurityGroups+'&#xa;';
                            html_running +='                    "></div>';
                            html_running +='                </div>';
                            html_running +='                <div class="tooltip-main">'+ec2_id+'</div>';
                            html_running +='            </div>';
                            html_running +='        </div>';
                            html_running +='    </td>';
                            
                            html_running +='    <td>'+ec2_Public_DNS+'</td>';
                            html_running +='    <td>';
                            html_running +='        <label class="switch switch-text">';
                            html_running +='            <input id='+ec2_id+' class="switch-input" type="checkbox" checked />';
                            html_running +='            <span class="switch-label" data-on="ON" data-off="OFF"  ></span>';
                            html_running +='        </label>';
                            html_running +='    </td>';
                            html_running +='</tr>';

                            running_count++;

                        break;

                        case 'stopped':

                            html_stopped +='<tr>';
                            html_stopped +='    <td>'+stopped_count+'</td>';
                            
                            html_stopped +='    <td>';
                            html_stopped +='        <div class="wgt-center-hw">';
                            html_stopped +='            <div class="wgt-tooltip">';
                            html_stopped +='                <div class="tip-area">';
                            html_stopped +='                    <div class="tooltiptext ani-opacity ani-scale" wgt-tip="';
                            html_stopped +='                        EC2-Name : '+ec2_name+'&#xa;';
                            html_stopped +='                         EC2-InstanceType : '+ec2_InstanceType+'&#xa;';
                            html_stopped +='                    "></div>';
                            html_stopped +='                </div>';
                            html_stopped +='                <div class="tooltip-main">'+ec2_id+'</div>';
                            html_stopped +='            </div>';
                            html_stopped +='        </div>';
                            html_stopped +='    <td>';
                            
                            html_stopped +='        <label class="switch switch-text">';
                            html_stopped +='            <input id='+ec2_id+' class="switch-input" type="checkbox" />';
                            html_stopped +='            <span class="switch-label" data-on="ON" data-off="OFF" ></span>';
                            html_stopped +='        </label>';
                            html_stopped +='    </td>';
                            html_stopped +='</tr>';

                            stopped_count++;

                        break;
                    }

                }
            }
        }else{
            console.log('null');
        }

        document.getElementById('running_ec2').innerHTML = html_running;
        document.getElementById('stopped_ec2').innerHTML = html_stopped;

        var now_time = new Date();

        var time_txt = now_time.getFullYear()+'-'+(now_time.getDate()+1)+'-'+now_time.getDay()+' '+now_time.getHours()+':'+now_time.getMinutes()+':'+now_time.getSeconds();

        var html_console ='';
        html_console += 'Search Finish!!';

        ec2_console('EC2-Info');
        ec2_console_content(html_console);
    });
    
}

/**
 * Send setting to creat EC2 from ami 
 */
ec2_socket.prototype.send_ec2_modal_info = function(){
    
    var ec2_ami = document.getElementById("ec2-ami").value;
    var ec2_it = document.getElementById("ec2-it").value.trim();
    var ec2_ebs = document.getElementById("ec2-ebs").value.trim();
    var ec2_sg = document.getElementById("ec2-sg").value;
    var ec2_tags = document.getElementById("ec2-tags").value;
    var ec2_key = document.getElementById("ec2-key").value;
    
    if(ec2_it != '' && ec2_it.length >= 7 && ec2_ebs != '' && parseInt(ec2_ebs) >= 20){
        var confirm_box = '';
            confirm_box += '請確認是否開啟此新主機? \n ';
            confirm_box += 'AMI = '+ec2_ami+' \n ';
            confirm_box += 'IT = '+ec2_it+' \n ';
            confirm_box += 'EBS = '+ec2_ebs+'G \n ';
            confirm_box += 'SG = '+ec2_sg+' \n ';
            confirm_box += 'TAG = '+ec2_tags+' \n ';
            confirm_box += 'KEY = '+ec2_key+' \n ';

        if (confirm(confirm_box) == true) {
            
            modal_close();
            
            this.socket.emit('creat_ec2', {
                ImageId:ec2_ami,
                InstanceType:ec2_it,
                VolumeSize:ec2_ebs,
                SecurityGroupIds:ec2_sg,
                Tags:ec2_tags,
                KeyName:ec2_key
            });

            this.socket.once('ec2_creat_status', function(data){
                var now_time = new Date();

                var time_txt = now_time.getFullYear()+'-'+(now_time.getDate()+1)+'-'+now_time.getDay()+' '+now_time.getHours()+':'+now_time.getMinutes();

                var html='';
                html += '================== "Creat_EC2" '+time_txt+' ==================\n';
                html += 'EC2_status : '+data.EC2_status+'\n';
                html += 'Tag_status : '+data.Tag_status+'\n';

                document.getElementById('console-text').innerHTML += (html+'\n');

                var context_sh = document.getElementById('console-text').scrollHeight;//取得高度

                document.getElementById('console-text').scrollTop = context_sh; //至底
                
                get_one_ec2_timer = setInterval(function(){ this.get_one_ec2_info(data.InstanceIds,'start') }.bind(this), 5000);
                
            }.bind(this));
            
            
            
        } else {
            console.log('false');
        }
    }else{
        alert('資料錯誤!!');
    }
    
};

/**
 * Get creat EC2 all info 
 * ami , sg , tags , key
 */
ec2_socket.prototype.get_ec2_modal_info = function(){

    this.socket.emit('get_ec2_modal_info');

    this.socket.once('get_ec2_ami', function(data){
        var ami_html='';
        for(var key in data.get_ec2_ami.Images){
            
            var ami_name = data.get_ec2_ami.Images[key].Name;
            var ami_id = data.get_ec2_ami.Images[key].ImageId;
            
            ami_html +='<option value="'+ami_id+'">[ '+ami_name+' ] '+ami_id+'</option>';
            //console.log('AMI-Name' , data.get_ec2_ami.Images[key].Name);
            //console.log('AMI-ImageId' , data.get_ec2_ami.Images[key].ImageId);
        }
        document.getElementById("ec2-ami").innerHTML = ami_html;
    });
    
    this.socket.once('get_ec2_sg', function(data){
        var sg_html='';
        for(var key in data.get_ec2_sg.SecurityGroups){
            
            var sg_name = data.get_ec2_sg.SecurityGroups[key].GroupName;
            var sg_id = data.get_ec2_sg.SecurityGroups[key].GroupId;
            
            sg_html +='<option value="'+sg_id+'">[ '+sg_name+' ] '+sg_id+'</option>';
            //console.log('SG-GroupName' , data.get_ec2_sg.SecurityGroups[key].GroupName);
            //console.log('SG-GroupId' , data.get_ec2_sg.SecurityGroups[key].GroupId);
        }
        document.getElementById("ec2-sg").innerHTML = sg_html;
    });
    
    this.socket.once('get_ec2_tags', function(data){
        var tags_html='';
        //console.log(data.get_ec2_tags.Tags);
        for(var key in data.get_ec2_tags.Tags){
            
            var tags_name = data.get_ec2_tags.Tags[key].Value;
            
            tags_html +='<option value="'+tags_name+'">'+tags_name+'</option>';
            //console.log('Key-Name' , data.get_ec2_key.KeyPairs[key].KeyName);
        }
        document.getElementById("ec2-tags").innerHTML = tags_html;
    });

    this.socket.once('get_ec2_key', function(data){
        var key_html='';
        for(var key in data.get_ec2_key.KeyPairs){
            
            var key_name = data.get_ec2_key.KeyPairs[key].KeyName;
            
            key_html +='<option value="'+key_name+'">'+key_name+'</option>';
            //console.log('Key-Name' , data.get_ec2_key.KeyPairs[key].KeyName);
        }
        document.getElementById("ec2-key").innerHTML = key_html;
    });

};

var get_one_ec2_timer;


/**
 * Get once EC2 status
 * @param {string} InstanceIds - EC2 id
 * @param {string} status      - start | stop
 */
ec2_socket.prototype.get_one_ec2_info = function(InstanceIds,status){
    
    this.socket.emit('get_one_ec2_info', { InstanceIds : InstanceIds });
    this.socket.once('get_one_ec2_info', function(data){
        
        switch(status){
            case 'start':
                var ec2_status = data.get_one_ec2_info[0].Instances[0].State.Name;
                
                if(ec2_status == 'running'){
                    clearInterval(get_one_ec2_timer);
                    
                    var html_content = '"'+InstanceIds+'" running...';
                    ec2_console_content(html_content);
                    
                    this.get_ec2_info();
                }
            break;
            case 'stop':
                var ec2_status = data.get_one_ec2_info[0].Instances[0].State.Name;

                if(ec2_status == 'stopped'){
                    clearInterval(get_one_ec2_timer);
                    
                    var html_content = '"'+InstanceIds+'" stopped...';
                    ec2_console_content(html_content);
                    
                    this.get_ec2_info();
                }
            break;
        }
        
        
        //console.log(data.get_one_ec2_info[0].Instances[0].State.Name);
    }.bind(this));
}

/**
 * Set timer to check EC2 status (start)
 * @param {string} - InstanceIds EC2 id
 */
ec2_socket.prototype.start_ec2 = function(InstanceIds){
    this.socket.emit('start_ec2', { InstanceIds : InstanceIds });
    this.socket.once('start_ec2', function(data){
        
        var html_content = '"'+InstanceIds+'" '+data.start_ec2+'...';
        ec2_console_content(html_content);
        //console.log(data);
        //console.log(data.start_ec2);
        get_one_ec2_timer = setInterval(function(){ this.get_one_ec2_info(InstanceIds,'start') }.bind(this), 5000);
    }.bind(this));
    
}

/**
 * Set timer to check EC2 stop (stop)
 * @param {string} - InstanceIds EC2 id
 */
ec2_socket.prototype.stop_ec2 = function(InstanceIds){
    this.socket.emit('stop_ec2', { InstanceIds : InstanceIds });
    this.socket.once('stop_ec2', function(data){
        
        var html_content = '"'+InstanceIds+'" '+data.stop_ec2+'...';
        ec2_console_content(html_content);
        //console.log(data);
        //console.log(data.stop_ec2);
        get_one_ec2_timer = setInterval(function(){ this.get_one_ec2_info(InstanceIds,'stop') }.bind(this), 5000);
    }.bind(this));
    
    
}