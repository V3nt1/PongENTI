# Documentación - PongENTI

## Explicación de los archivos

### Index.js

Este archivo actúa como servidor de nuestro PongENTI. En él, se encuentra toda la lógica relacionada con el recibimiento y envío de datos entre los diferentes usuarios que estén utilizando nuestra página web.

```JavaScript
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
```
