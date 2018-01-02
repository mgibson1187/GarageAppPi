// get modules
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var _ = require('lodash');

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

var door = {
  state: 1,
  set change(x) {
    this.state = x;
  }
};

sensor.watch((err, state) => {
	console.log('watch', state);
});

io.on('connection', (socket) => {
	// watch sensor + websocket
	socket.emit('recieve', (state) => {
		return door.state;
	});
});

io.on('connection', (socket) => {
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