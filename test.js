var fs = require("fs");

var sensors = JSON.parse(fs.readFileSync("./sensors.cfg"));
var allPath = new Array();

sensors.forEach(
    function(x) {
        allPath.push(sensors.sensors[x].path);
})