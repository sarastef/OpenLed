var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var five = require("johnny-five");


/* UTILISATION D'EXPRESS */
app.use(express.static('public'));
app.get('/', function (req,res) { 
  	res.sendFile(__dirname + '/index.html');
});
 
 /* Le port série auquel est connecté notre Arduino */
var board = new five.Board({
	port: "/dev/cu.usbmodem1421"
});


/* CONNEXION ARDUINO */
 
board.on('ready', function () {
    var speed, commands;

    /* LEDS */
    var ledVert=new five.Led(8);
    var ledRouge=new five.Led(9);
    var ledBleu=new five.Led(7);

    var lcd = new five.LCD({
        // LCD pin name  RS  EN  DB4 DB5 DB6 DB7
        pins: [12,11, 5, 4, 3, 2],
    });

      var frame = 1;
      var frames = [":runninga:", ":runningb:"];
      var row = 0;
      var col = 0;


      lcd.useChar("runninga");
      lcd.useChar("runningb");

      
    
    var blink = true;
 
    commands = null;
 
    ledVert.on();
    ledVert.blink(1000);
    this.loop(300, function() {
                lcd.clear().cursor(row, col).print(
                  frames[frame ^= 1]
                );

                if (++col === lcd.cols) {
                  col = 0;
                  if (++row === lcd.rows) {
                    row = 0;
                  }
                }
    }); 

    /* SOCKET IO */
 
    io.on('connection', function (socket) {

        // Message à la connexion
        console.log("conection socket");

        // Le serveur reçoit un message" du navigateur 
        
      	socket.on('bleu', function (){
            // Si le message envoyé est bleu on allume le led bleu
			ledBleu.on();
		});
		
		socket.on('rouge', function (){
		    ledRouge.on();
		});
       
        socket.on('vert', function (){
            ledVert.on();
           
        });
 
        socket.on('stop', function (){
            if (blink){
                // stop      
                ledVert.stop();
                ledRouge.stop();
                ledBleu.stop(); 
                blink = false;
                lcd.off();
            }
            else{
                ledVert.blink(1000);
                ledRouge.blink(1000);
                ledBleu.blink(1000);
                blink = true;
            }
        });
 
        socket.on('off', function (){
            ledVert.off(); 
            ledRouge.off();  
            ledBleu.off();   
            lcd.off();
        });
 
        socket.on('on', function (){
            ledVert.on();
            ledRouge.on();
            ledBleu.on(); 
            

        });
 
    });
    
});

/* SERVEUR */
server.listen(8080, function() {
	console.log('Serveur en marche sur http://localhost:8080');
});