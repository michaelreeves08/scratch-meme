var arDrone = require('ar-drone');
var client  = arDrone.createClient();

client.config('general:navdata_demo', 'FALSE');

client.on('navdata', function(navdata) {
    if(navdata.rawMeasures && navdata.demo && navdata.pwm){
        console.log(
            'PITCH: ' + navdata.demo.rotation.pitch + '\n' +
            'ROLL: ' + navdata.demo.rotation.roll + '\n' +
            'YAW: ' + navdata.demo.rotation.yaw + '\n\n\n'
        )
    }
  
 });

 