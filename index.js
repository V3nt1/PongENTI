#!/usr/bin/node

let http = require("http");

let websocket = require("websocket").server;

console.log("Iniciando servidor PONG BATTLE ROYALE");

const PORT = 1657;

let http_server = http.createServer(function(req,res){

res.write("ola");
res.end();
});

http_server.listen(PORT);

let websocket_server = new websocket({
	httpServer: http_server
});

let conn1;
let conn2;
let spectators = [];
let started = false;

let currentspectator = 3;

websocket_server.on("request", function(req){

	if(conn1 == undefined){
	  conn1 = req.accept(null, req.origin);
		conn1.send('{"player_num":1}');
		console.log("Player 1 Connected");

		conn1.on("message", function(msg) {
			conn2.send(msg.utf8Data);
			spectators.forEach(function(element,index,array){
				element.send(msg.utf8Data);
			});
		});
	}
	else if(conn2 == undefined){
		conn2 = req.accept(null, req.origin);
		conn2.send('{"player_num":2}');
		console.log("Player 2 Connected");

		conn2.on("message", function(msg) {
			conn1.send(msg.utf8Data);
			spectators.forEach(function(element,index,array){
				element.send(msg.utf8Data);
			});
		});

		setTimeout(function(){
		console.log("Start!!!!!!");
			let msg = '{"start":true}';
				conn1.send(msg);
				conn2.send(msg);
				started = true;
				spectators.forEach(function(element,index,array){
				element.send(msg);
			});
		},10000);
	}else{
		let conn_n = req.accept(null,req.origin);
		conn_n.send('{"player_num":'+currentspectator+'}');
		if(started){
		conn_n.send('{"start":true}');
		}
		console.log("Spectator "+currentspectator+" connected");
		currentspectator++;
		spectators.push(conn_n);
	}
});
