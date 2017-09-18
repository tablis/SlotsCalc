//const fs = require('fs');
const child_process = require('child_process');
const os = require("os");
var param = process.argv.slice(2);
var childDirPath = param[0];
var runTimes = param[1];
var betValue = param[2];
var processCount = param[3];
var processIdx = 0;
var arrResult = [];
var startTime = new Date().getTime();
var cpuCount = os.cpus().length;
processCount = cpuCount;//默认使用cpu核数个进程数
runTimes=runTimes/processCount;
for (var i = 0; i < processCount; i++) {
    var workerProcess = child_process.exec('node' + ' ' + childDirPath + ' ' + runTimes + ' ' + betValue,
        //错误、输出、错误
        function (error, stdout, stderr, tmpI) {
            /*if (error) {
             console.log(error.stack);
             console.log('Error code: ' + error.code);
             console.log('Signal received: ' + error.signal);
             }*/
            processIdx++;
            console.log('stdout: ' + stdout.slice(stdout.indexOf("Result:") + 7));
            var result = stdout.slice(stdout.indexOf("Result:") + 7);
            arrResult.push(JSON.parse(result));
            if (arrResult.length == processCount) {
                var tmpJson = arrResult[0];
                var tmpJson = {};
                for (var j = 0, lenJ = arrResult.length; j < lenJ; j++) {
                    for (var o in arrResult[j]) {
                        if (typeof tmpJson[o] == "undefined") {
                            tmpJson[o] = 0;
                        }
                        tmpJson[o] = Number(tmpJson[o]) + Number(arrResult[j][o]);
                    }
                }
                tmpJson['ConsumeTime'] = new Date().getTime() - startTime;
                console.log("总的：" + JSON.stringify(tmpJson));
            }
            // console.log('stderr: ' + stderr);
        });
}
/*workerProcess.on('exit', function (code) {
 console.log('子进程已退出，退出码 ' + code);
 });*/
