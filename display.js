//Initialisiere Das Module was für das E-Paper zuständig ist
import { Drawer, Paper75HDB } from "ws-paper";

var fs = require("fs");

const device = new Paper75HDB();
const drawer = new Drawer(device);


for(;true;){

//Liest alle Dateien mit den Sensorwerten ein

try {
var airhumid = JSON.parse(fs.readFileSync("./air-humid.sen"));   
} catch (error) {
    console.log("Air Humidity unknown");
    var airhumid = "unknown";
}

try {
var airpress = JSON.parse(fs.readFileSync("./air-press.sen"));
} catch (error) {
    console.log("Air Pressure unknown");
    var airpress = "unknown";
}

try {
    var color = JSON.parse(fs.readFileSync("./color.sen"));
} catch (error) {
    console.log("Color unknown");
    var color = "unknown";
}

try{ 
    var light = JSON.parse(fs.readFileSync("./light.sen"));
} catch (error) {
    console.log("Light Level unknown");
    var light = "unknown";
}

try {
    var rain = JSON.parse(fs.readFileSync("./rain.sen"));
} catch (error) {
    console.log("Rain unknown");
    var rain = "unknown";
}

try{
    var sound = JSON.parse(fs.readFileSync("./sound.sen"));
} catch (error) {
    console.log("Sound Level unknown");
    var sound = "unknown";
}

//Checkt ob es Regnet und setzt die Variable entsprechend auf Ja oder Nein
var raining="";
if(rain.value){
raining = "Yes";
} else {
    raining = "Nein";
}
//Checkt ob die Farbe richtig erkannt wird und wenn sie ungültig ist wird unknown angezeigt
if(isNaN(color.R)){
    color.R = "unknown";
    color.G = "";
    color.B = "";
}

//Das was angezeigt wird (IDK Why HTML)
const svg = `
<svg width="${device.width}" height="${device.height}">
    <text font-size="50" x="50%" y="20%" text-anchor="middle">
        Air Humidity: ` + airhumid.value + `\\r\\nAir Pressure: ` + airpress.value + `\\r\\nColor: ` +  color.R + ` ` + color.G + ` ` + color.B + `\\r\\nLight Level: ` + light.value + `\\r\\nIs it Raining?: ` + raining + `\\r\\nSound Level: ` + sound.value + `
    </text>
</svg>
`;
//console.log(svg);
device.initialize();
drawer.drawSvg(svg).finally(() => device.finalize());
var waitTill = new Date(new Date().getTime() + 200);
while(waitTill > new Date()){}
}