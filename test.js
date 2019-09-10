let express = require('express');
let app = express();
let router = express.Router();
let exec = require('child_process').exec;
let port = 9000;
//app.use(express.static(__dirname + '/public'));
//app.use('/img', express.static(__dirname + '/public/img'));

let header = '<!DOCTYPE html><html><head><title>ctrl PHP</title>'
        + '<meta http-equiv="Content-Type" content="text/html; charset=utf-8">'
        + '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">'
        + '</head><body><pre>';
let footer = "</pre></body></html>";

router.get('/', function (req, res, next) {
    //預設頁面
    console.log('index');
    res.sendfile('index.html', {root: __dirname + "/public"});
});
router.get('/ls', function (req, res, next) {
    //執行 ls -al 指令
    exec('ipconfig', function (err, stdout, stderr) {
        console.log('ls');
        res.send(header + stdout + footer);
    });
});

app.use('/', router);
app.listen(port);