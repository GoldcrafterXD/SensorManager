var http = require("http");
var fs = require("fs");
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });


function debugInfo(a) {
    var conf = JSON.parse(fs.readFileSync("./config.cfg"));
    if(conf.enableConsoleDebug == true){
        if(conf.level == "Debug"){
            console.log(a);
        }
    }
}




debugInfo("Imported Modules");
var date = new Date();
var dir = "./";
var logs = fs.readdirSync(dir);
debugInfo("Check for Old Logs");
var conf = JSON.parse(fs.readFileSync("./config.cfg"));
debugInfo("Read Config");

readline.question("", function(answer) {
    if(answer == "stop" || answer == "exit"){
        process.exit();
    }
    if(answer.startsWith("set")){
        if(answer.startsWith("set keepOldLogs")){
            if(answer.endsWith("true")){
                console.log("Changes Will Take Effect after Restart");
                conf.keepOldLogs = true;
            }
            if(answer.endsWith("false")){
                console.log("Changes Will Take Effect after Restart");
                conf.keepOldLogs = false;
            }
        }
        if(answer.startsWith("set enableConsoleDebug")){
            if(answer.endsWith("true")){
                console.log("Changes Will Take Effect Immediatly");
                conf.enableConsoleDebug = true;
            }
            if(answer.endsWith("false")){
                console.log("Changes Will Take Effect Immediatly");
                conf.enableConsoleDebug = false;
            }
        }
        if(answer.startsWith("set amount")){
            if(isNaN(answer.slice(-1))){
                console.log("command used wrongly | set amount x | x accepts only number 1-9");
            } else {
                conf.amount = Number(answer.slice(-1));
            }
        }
        if(answer.startsWith("set level")){
            if(answer.endsWith("Debug") || answer.endsWith("debug")){
                conf.level = "Debug";
            }
        }
        fs.writeFileSync("./config.cfg", JSON.stringify(conf));
    }
});

//THIS SHIT DELETES THE NEWEST INSTEAD OF OLDEST LOGS FUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUCK (Works now)
if(conf.keepOldLogs){
    debugInfo("keepOldLogs enabled");
    var x=0;
    var files = new Array();
    logs.forEach(
        function(file) {
            if(file.endsWith(".log")){
            files.push(file);
            x++;
            }
        })
        debugInfo("Read Logs");
        for(let x=0; x<(files.length-conf.amount);x++){
            fs.unlinkSync(files[x]);
    }
    debugInfo("Sorted Logs and Removed Old Logs");
    } else {
        debugInfo("keepOldLogs disabled");
        var x=0;
        var files = new Array();
        logs.forEach(
            function(file) {
                if(file.endsWith(".log")){
                files.push(file);
                x++;
                }
            })
            debugInfo("Read Logs");
            for(let x=0; x<(files.length);x++){
                fs.unlinkSync(files[x]);
    }
}


var betterDate = date.toISOString().replace(/:/gm, "-");
debugInfo("Enabled Custom Date Type for Filename");
var DateTimeStart = betterDate;
debugInfo("Starting Webserver");
var server = http.createServer(function(req, res){
    let body ="";
    let ans = '200';
    var result="";
    debugInfo(req.method);
    req.on('data', (chunk) => {
            body += chunk;
            if(req.method == "POST"){
                debugInfo("Recieved POST Request");
                var dateNow = new Date();
                var betterDateNow = dateNow.toLocaleString("de-DE", { 
                    timeZone: "Europe/Vienna",
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour:"2-digit",
                    minute:"2-digit",
                    second:"2-digit"
                }).replace(/, /gm, " [") + "]";
                debugInfo("Generated Custom Date Type for Logs");
                var DateTimeNow = betterDateNow;
                var log ="";
                try {
                    log = fs.readFileSync("./" + DateTimeStart + ".log");
                } catch (error) {
                    debugInfo("No existing Log File for current Run found, Generating new");
                }
                fs.writeFileSync("./" + DateTimeStart + ".log", log + "\r\n" + DateTimeNow + " " + req.socket.remoteAddress + " " + req.url + " " + body.replace(/\r?\n/gm, ""));
                debugInfo("New Log Generated");



                if(req.url == "/air-humid" || req.url == "/air-press" || req.url == "/light" || req.url == "/sound" || req.url == "/rain" || req.url == "/color" ){
                    debugInfo("POST Request sent to allowed Path");
                fs.writeFileSync("./" + req.url.replace(/\//gm, "") + ".sen", body);
                debugInfo("Wrote Data to .sen File");
                } else {
                    if(req.url == "/settings"){
                        debugInfo("Got new Config");
                        fs.writeFileSync("./config.cfg", body);
                        debugInfo("Wrote new config to config.cfg");
                    } else {
                        debugInfo("Recieved Bad Request");
                    ans = "400";
                    }
                }
            }
    });
    
try {
    if(req.method == "GET"){
        debugInfo("GET Request");
        debugInfo("Trying to get available Sensor Info");
        if(req.url == "/air-humid"){
            var airhumid = JSON.parse(fs.readFileSync("./air-humid.sen"));
            result=airhumid.value;
            debugInfo(airhumid);
        }
        if(req.url == "/air-press"){
            var airpress = JSON.parse(fs.readFileSync("./air-press.sen"));
            result=airpress.value;
        }
        if(req.url == "/light"){
            var light = JSON.parse(fs.readFileSync("./light.sen"));
            result=light.value;
        }
        if(req.url == "/sound"){
            var sound = JSON.parse(fs.readFileSync("./sound.sen"));
            result=sound.value;
        }
        if(req.url == "/rain"){
            var rain = JSON.parse(fs.readFileSync("./rain.sen"));
            result=rain.value;
        }
        if(req.url == "/color"){
            result=fs.readFileSync("./color.sen");
        }
        
    }
} catch (error) {
    result="undefined";
    debugInfo("Sensor Info not found, sending undefined");
}
    req.on('end', () => {
        res.statusCode = ans;
        res.writeHead(ans, {"Content-Type": "text/html"});
        res.end(result.toString());
    })
    

}).listen(8080);