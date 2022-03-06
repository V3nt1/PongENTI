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

Vamos a ir explicando poco a poco el código de arriba.

Lo primero y más importante, es la lógica de qué hacer al recibir una solicitud de conexión a nuestro servidor (**on("request")**).
En nuestro caso, lo que queremos es que la primera persona en conectarse se convierta en el jugador 1, que la segunda se convierta en el jugador 2, y que a partir de ese momento, todos los nuevos usuarios que se unan se conviertan en espectadores. Para ello, contamos con 2 variables independientes (conn1, conn2) y un array de espectadores.

A continuación, cada una de estas conexiones tiene su propia funcion **on("message")**, que se llama cada vez que se envian datos desde nuestro index.html para que el resto de jugadores o espectadores estén sincronizados. Nada más recibir la información, lo que hacemos es enviarsela al resto de jugadores con la funcion **send()**.

### Index.html

Este script es el encargado de la lógica de nuestro Pong, es decir, el movimiento de las palas, los scores y de la pelota.

Vamos a ir analizandolo poco a poco:

```JavaScript
ws.onmessage = function(event){
	let data = JSON.parse(event.data);
	if(data.player_num != undefined){
		player_num = data.player_num;
	}
	if(data.start != undefined){
		console.log("He llegado!");
		start = true;
	}
	if (data.player1_y != undefined){
		player1_y = data.player1_y;
		ball_x = data.ball_x;
		ball_y = data.ball_y;
	}
	if (data.player2_y != undefined){
		player2_y = data.player2_y;
	}
	if (data.player1score != undefined){
		score1_text.text = data.player1score;
	}
	if (data.player2score != undefined){
		score2_text.text = data.player2score;
	}
	if(data.restartGame != undefined){
	  restartGame = true;
	}
	if(data.win1 != undefined){
		win1 = data.win1;
	}
	if(data.win2 != undefined){
		win2 = data.win2;
	}
};
```
Arriba del todo, nos encontramos con la funcion **onmessage()**, que se encarga de filtrar la información obtenida desde el send() del servidor y utilizarla para sincronizarse con el resto de jugadores.

A continuación, entre otras variables que no son tan importantes de mencionar, nos encontramos con la variable player_num, que es la encargada de asegurarse de que solo se puedan mover las palas en caso de ser alguno de los jugadores, de manera que los espectadores no puedan jugar. En caso de ser player_num 1, al pulsar las flechas se movera la pala izquierda, en caso de ser player_num 2, la derecha.

Finalmente, contamos con el envío de los datos:

```JavaScript
if(player_num == 1){
	let pos = '{"player1_y":'+player1_y+',';
	pos += '"ball_x":'+ball_x+',"ball_y":'+ball_y+',';
	pos += '"player1score":'+player1_score+',"player2score":'+player2_score+'}';
	ws.send(pos);
}
else if (player_num == 2){
	let pos = '{"player2_y":'+player2_y+'}';
	ws.send(pos);
}
```

Teniendo en cuenta que el jugador 1 es el que actua como host, y es el encargado de enviar la mayor parte de la información sobre el juego (por asi decirlo, el juego se está desarrollando únicamente en la pantalla del primer jugador, el segundo jugador lo que está viendo es una representación del juego del primero), es el que más información envía tanto al jugador 2 como a los espectadores.

Enviará tanto la posicion de su pala, como la de la pelota como los scores de ambos jugadores, mientras que el jugador 2 solo debe preocuparse de enviar la posicion de su pala.
Los espectadores, en cambio, no deben enviar ninguna información porque no están jugando, solo necesitan recibirla.
