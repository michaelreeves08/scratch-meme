var app = require('http').createServer();
var io = require('socket.io')(app);

var arDrone = require('ar-drone');
var client  = arDrone.createClient();
client.config('general:navdata_demo', 'FALSE');

app.listen(8080);


io.on('connection', function(socket){

    socket.emit("socketConnected");

    refreshAvailablePorts(function(_allPorts, _portName, _baudRate){
        changePort(_portName, _baudRate);
    });

    socket.on('initPort', function(data){
        refreshAvailablePorts(function(){
            var _portName = data.portName || portName;
            var _baudRate = data.baudRate || baudRate;
            if (!checkThatPortExists(_portName)) return;
            changePort(_portName, _baudRate);
        });
    });
    var takeoff = false;
    var stopping = false;
    var moveSpeed = .5;

    socket.on('dataOut', function(data){
        if(data == 'takeoff' && !takeoff){
            client.takeoff();
            console.log('TAKEOFF');
            takeoff = true;
        }
        else if(data == 'land' && takeoff){
            client.land();
            console.log('LAND')
            takeoff = false;
        }
        else if(data == 'stop' && !stopping){
            console.log('STOP');
            stopping = true;
            client.stop();
        }
        else if(data == 'HIT' && takeoff){
            console.log('HIT');
            switch(Math.floor(Math.random() * 4)){
                case 0:
                    client.animate('flipAhead',500);
                    break;
                case 1:
                    client.animate('flipRight',500);
                    break;
                case 2:
                    client.animate('flipLeft',500);
                    break;
                case 3:
                    client.animate('flipBehind',500);
                    break;
            }
        }
        else if(data.charAt(0) == 'F'){
            stopping = false;
            console.log('Forward')
            client.front(moveSpeed);
        }
        else if(data.charAt(0) == 'B'){
            stopping = false;
            console.log('Backward')
            client.back(moveSpeed);
        }
        else if(data.charAt(0) == 'R'){
            stopping = false;
            console.log('Right')
            client.right(moveSpeed);
        }
        else if(data.charAt(0) == 'L'){
            stopping = false;
            console.log('Left')
            client.left(moveSpeed);
        }
        else if(data.charAt(0) == 'U'){
            stopping = false;
            console.log('Up')
            client.up(moveSpeed);
        }
        else if(data.charAt(0) == 'D'){
            stopping = false;
            console.log('Down')
            client.down(moveSpeed);
        }
        else if(data.charAt(0) == 'C'){
            stopping = false;
            console.log('Clockwise')
            client.clockwise(moveSpeed);
        }
        else if(data.charAt(0) == 'O'){
            stopping = false;
            console.log('CounterClockwise')
            client.counterClockwise(moveSpeed);
        }
    });



    socket.on('flush', function(){
        if (currentPort) currentPort.flush(function(){
            console.log("port " + portName + " flushed");
        });
    });

    socket.on('refreshPorts', function(){
        refreshAvailablePorts();
    });

    socket.on('disconnectPort', function(){
        disconnectPort();
    });

    function checkThatPortExists(_portName){
        if (allPorts.indexOf(_portName) < 0) {
            onPortError("no available port called " + _portName);
            return false;
        }
        return true;
    }

    var rateLimit = 0;
    client.on('navdata', function(navdata) {
        if(navdata.rawMeasures && navdata.demo && navdata.pwm ){
            if(rateLimit == 10){
                onPortData('P' + Math.round(navdata.demo.rotation.pitch).toString());
            }
            else if(rateLimit == 20){
                onPortData('R' + Math.round(navdata.demo.rotation.roll).toString());
            }
            else if(rateLimit == 30){
                onPortData('A' + Math.round(navdata.demo.altitude * 10).toString());
                rateLimit = 0;
            }
        }
        //console.log(navdata.demo.batteryPercentage);
        rateLimit++;
      
     });
});






