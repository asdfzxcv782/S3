"use strict"; //use es6
function main_GT(pele,index_name,div)
{
    document.getElementById(div).innerHTML = '';
//            this.element = document.createElement('div');
//            this.element.className = 'main';
    this.folderPath = document.createElement('div');
    this.folderPath.className = 'L';
//            this.control = document.createElement('div');
//            this.control.className = 'R';
//            this.control.style.display='none';
//            document.getElementById('file_tree').appendChild(this.control);
    document.getElementById(div).appendChild(this.folderPath);
    //pele.appendChild(this.element);
    //this.folder = new folder_GT(this.folderPath, 'ushowgamefile', '/', this);
    this.folder = new folder_GT(this.folderPath, index_name, [index_name], this);
}

main_GT.prototype =
{
    addFolder: function(array)
    {
        this.folder.add(array);
    },
    updateControlPath: function(path)
    {
        var path_html = '';

        var file_path = '';

        for(var i=0; i<(path.length-1);i++){

            path_html += '<li class="crumb-item">';
            path_html += '    <a class="crumb-link">'+path[i]+'</a>';
            path_html += '</li>';

        }

        path_html += '<li class="crumb-end">'+path[(path.length-1)]+'</li>';

        for(var i=1; i<path.length;i++){

            if(path[i].indexOf('.') > -1){
                file_path += (path[i]);
            }else{
                file_path += (path[i]+'/');
            }

        }

        get_file_info(file_path);

        document.getElementById('file_path').innerHTML = file_path;
        document.getElementById('path').innerHTML = path_html;
    }
};

function folder_GT(pele, name, path, main,  file)
{
    this.main = main;
    this.pele = pele;
    this.path = path;
    this.element = document.createElement('div');
    this.mainElement = document.createElement('LI');
    this.mainElement.innerHTML = name;
    this.element.appendChild(this.mainElement);
    this.pele.appendChild(this.element);

    this.subElement = document.createElement('UL');
    this.subElement.style.display = 'none';

    this.folderArea = document.createElement('LI');
    this.folderArea.style.display = 'none';
    this.fileArea = document.createElement('LI');
    this.fileArea.style.display = 'none';
    this.element.appendChild(this.subElement);
    if(!file)
    {
        this.lastPath = document.getElementById('file_path').innerHTML.split('/');//處理目前路徑
        var test = this.lastPath.filter(word => word == name)
        this.subElement.appendChild(this.folderArea);
        this.mainElement.onclick = this.open.bind(this);
        //this.mainElement.click();
        this.mainElement.className = `folder`;
        if(name === path[0]){
            console.log('click')
            this.subElement.style.display = 'block';
        }else if(test.length !==0){
            console.log('click')
            this.subElement.style.display = 'block';
        }
        this.subFolder = {};
        this.subFile = {};
    }
    else
    {
        this.mainElement.onclick = function()
        {
            this.main.updateControlPath(this.path);
        }.bind(this);
        this.mainElement.className = `file`;
    }
    this.subElement.appendChild(this.fileArea);

}
folder_GT.prototype =
{
    open: function()
    {
        this.main.updateControlPath(this.path);
        this.mainElement.onclick = this.close.bind(this);
        this.subElement.style.display = 'block';
    },
    close: function()
    {
        this.main.updateControlPath(this.path);
        this.mainElement.onclick = this.open.bind(this);
        this.subElement.style.display = 'none';
    },
    add: function(array)
    {
        var x = array.shift();
        if(x !== undefined)
        {
            var xxx = this.path.slice(0);
            xxx.push(x);
            if(array[0] !== undefined )
            {
                if(this.subFolder[x] === undefined)
                {
                    this.folderArea.style.display = 'block';
                    //this.subFolder[x] = new folder_GT(this.folderArea, x, this.path + x + '/', this.main);
                    this.subFolder[x] = new folder_GT(this.folderArea, x, xxx, this.main);
                }
                this.subFolder[x].add(array);
            }
            else if(x !== '')
            {
                
                if(this.subFile[x] === undefined )
                {
                    this.fileArea.style.display = 'block';
                    //this.subFile[x] = new folder_GT(this.fileArea, x, this.path + x , this.main, true);
                    this.subFile[x] = new folder_GT(this.fileArea, x, xxx , this.main, true);
                }
            }
        }
    },
};
