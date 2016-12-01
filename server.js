var express = require('express'),
    http = require('http'),
    bodyParser = require('body-parser'),
    app = express(),
    redis = require('redis'),
    io = require('socket.io'),
    player = require('play-sound')(opts = {});

var userPlaying = {};
var spectators = {};

client = redis.createClient();

client.on('connect', function() {
    console.log('connected');
});

app.use(express.static(__dirname + '/public'));

// Create server & socket
server = http.createServer(app).listen(3000);
server.listen(3000);
io = io.listen(server);
console.log('Running on port http://localhost:3000/');

// Home Page
app.get('/', function(req, res) {
    //res.render('index');
    res.sendFile(__dirname + '/index.html');
    player.play('foo.mp3', function(err){
      if (err) throw err
    });
});

// Add a connect listener
io.on('connection', function(socket) {

    //Joined Users Listener
    socket.on('join', function(username) {
        if(userPlaying.length == 5)
        {
            userPlaying[socket.id] = username;
            console.log('User Connected: ', userPlaying[socket.id]);
            io.emit('username', username);
            io.emit("update-users", userPlaying);
        }
        else
        {
            spectators[socket.id] = username;
            console.log('User Connected: ', spectators[socket.id]);
            io.emit('username', username);
            io.emit("update-users", spectators);
        }
    });

    // Disconnected Users Listener
    socket.on('disconnect', function() {
        console.log('User Disconnected: ', userPlaying[socket.id]);
        delete usersOnline[socket.id];
        io.emit("update-users", userPlaying);
    });
});
