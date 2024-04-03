const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Create a WebSocket instance by providing the server address
const ws = new WebSocket('ws://localhost:8080/ws/');

// WebSocket connection event handlers
ws.on('open', function open() {
  console.log('Connected to WebSocket server');
  
  // stdin.on('d', sendMessage);
  // // d = d.trim()
	// function sendMessage(d) {
	// 	data = data.trim();
    var command = {
      "command": "file",
      "argument": "heheheh",
      "sdp": "",
      "cid": 0 // your_cid_value
    };
    var jsonCommand = JSON.stringify(command);
    // Once connected, send a message to the server
    // ws.send('Hello from client!');
    ws.send(jsonCommand);
  // }
});

ws.on('message', function incoming(data) {
  // Read message received from the server
  var commandRec = JSON.parse(data);
  switch (commandRec.command) {
    case "checkFile":
        checkfileHandler(commandRec)
        break;
    case "Sdp":
        console.log("Sdp ASked")
        break;
    default:
        break;
  }
  console.log('Received message from server:', data);
});

// Handle errors
ws.on('error', function error(err) {
  console.error('WebSocket encountered error:', err);
});

// Handle connection close
ws.on('close', function close() {
  console.log('Disconnected from WebSocket server');
});

function checkfileHandler(commandRec) {
    console.log("checkfileHandler")
    var command = {
        command: "fileAvailable",
        argument: commandRec.cid,
        sdp: "",
        cid: 0
    };
    var jsonString = JSON.stringify(command);
    ws.send(jsonString)
}

server.listen(8000, function listening() {
    console.log('WebSocket server is listening on port 8080');
  });

// /*
// 	A minimal websocket client for node.js. This client 
// 	attempts to connect to a websocker server running on port
// 	8080. When it connects, it listens to the command line
// 	input and sends whatever text it receives there. 
// 	It also prints out any incominb messages from the websocket 
// 	server.

// 	created 17 Jan 2021
// 	modified 23 Feb 2023
// 	by Tom Igoe
// */


// var WebSocket = require('ws');
// var stdin = process.openStdin();	// enable input from the keyboard
// stdin.setEncoding('utf8');			  // encode everything typed as a string

// var ws = new WebSocket('ws://localhost:8080/ws/');

// // ws.on('open', function open() {
// // 	// this function runs if there's input from the keyboard.
// // 	// you need to hit enter to generate this event.
// // 	function sendMessage(data) {
// // 		data = data.trim();
// // 		ws.send(data);
// // 	}
// //   stdin.on('data', sendMessage);
// // 	ws.send('Hello');
// // });

// ws.on('error', function(error) {
// 	console.log(error);
// });

// ws.on('message', function(data, flags) {
// 	console.log('Server said: ' + data);	// print the message
// });

// ws.on('message', function incoming(data) {

//   // Read message received from the server
//   var commandRec = JSON.parse(data);
//   switch (commandRec.command) {
//     case "checkFile":
//         checkfileHandler(commandRec)
//         break;
//     case "Sdp":
//         console.log("Sdp ASked")
//         break;
//     default:
//         break;
//   }
//   console.log('Received message from server:', data);
// });

// // Handle errors
// ws.on('error', function error(err) {
//   console.error('WebSocket encountered error:', err);
// });

// // Handle connection close
// ws.on('close', function close() {
//   console.log('Disconnected from WebSocket server');
// });

// function checkfileHandler(commandRec) {
//     console.log("checkfileHandler")
//     var command = {
//         command: "fileAvailable",
//         argument: commandRec.cid,
//         sdp: "",
//         cid: 0
//     };
//     var jsonString = JSON.stringify(command);
//     ws.send(jsonString)
// }
