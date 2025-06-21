var x=0;
var y=0;

// OSC functions

function receiveOsc(address, value) {
	console.log("received OSC: " + address + ", " + value);

	if (address == '/test') {
		x = value[0];
		y = value[1];
	}
}

function sendOsc(address) {
	socket.emit('message', "/" + address);
	console.log("Sent OSC: " + address);
}

function sendOsc(address, value) {
	socket.emit('message', "/" + address + " " + value); // or [address].concat(value)
	console.log("Sent OSC: " + address + ", " + value);
}

function setupOsc(oscPortIn, oscPortOut) {
	socket = io.connect('http://127.0.0.1:8081', { port: 8081, rememberTransport: false });
	socket.on('connect', function() {
		socket.emit('config', {
			server: { port: oscPortIn, host: '127.0.0.1'},
			client: { port: oscPortOut, host: '10.252.11.133'}
		});
	});
	socket.on('message', function(msg) {
		if (msg[0] == '#bundle') {
			for (var i=2; i<msg.length; i++) {
				receiveOsc(msg[i][0], msg[i].splice(1));
			}
		} else {
			receiveOsc(msg[0], msg.splice(1));
		}
	});
}

// SetupOSC function with an additional parameter to define OSC client IP
function setupOsc(oscPortIn, oscPortOut, clientIP) {
	socket = io.connect('http://127.0.0.1:8081', { port: 8081, rememberTransport: false });
	socket.on('connect', function() {
		socket.emit('config', {
			server: { port: oscPortIn, host: '127.0.0.1'},
			client: { port: oscPortOut, host: clientIP}
		});
	});
	socket.on('message', function(msg) {
		if (msg[0] == '#bundle') {
			for (var i=2; i<msg.length; i++) {
				receiveOsc(msg[i][0], msg[i].splice(1));
			}
		} else {
			receiveOsc(msg[0], msg.splice(1));
		}
	});
}