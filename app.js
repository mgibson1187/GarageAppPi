// get node express modules
var express = require('express');
var app = express();

// get socket.io modules
var http = require('http').Server(app);
var io = require('socket.io')(http);

// get config file
var config = require('./config');

// setup port
app.set('port', process.env.PORT || config.client.port); // app.set('port', process.argv[2]);

// **************************************************************************
// ** Utility Functions *****************************************************
// **************************************************************************

// Sleep Function
function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

// **************************************************************************
// **************************************************************************

// **************************************************************************
// ** GPIO Setup ************************************************************
// **************************************************************************

var GPIO = require('onoff').Gpio;

var relay = new GPIO(3, 'out');
var sensor = new GPIO(17, 'in', 'both');

// start relay off
relay.writeSync(1);

// watch sensor + websocket
sensor.watch((err, state) => {
	io.sockets.emit('recieve', {
		state: sensor.readSync()
	});
});

io.on('connection', (socket) => {
	socket.emit('recieve', {
		state: sensor.readSync()
	});
	socket.on('reply', () => {
		relay.writeSync(0);
		sleep(250);
		relay.writeSync(1);
	});
});

// **************************************************************************
// **************************************************************************

// Start server
http.listen(app.get('port'), function(){
	console.log('Site started on http://' + config.client.host + ':' + app.get('port') + ' press Ctrl-C to terminate.');
});

module.exports = app;