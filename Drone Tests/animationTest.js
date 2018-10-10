var arDrone = require('ar-drone');
var client  = arDrone.createClient();

client.takeoff();

client
    .after(2000, function(){
        this.up(1)
    })

    .after(2000, function() {
        this.animate('flipAhead',500);
    })
    .after(2000, function(){
        this.land()
    })