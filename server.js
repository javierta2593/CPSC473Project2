var express = require('express'),
    http = require('http'),
    bodyParser = require('body-parser'),
    app = express(),
    redis = require('redis'),
    io = require('socket.io'),
    player = require('play-sound')(opts = {});

var usersOnline = {};

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
        usersOnline[socket.id] = username;
        console.log('User Connected: ', usersOnline[socket.id]);
        io.emit('username', username);
        io.emit("update-users", usersOnline);
    });

    // Disconnected Users Listener
    socket.on('disconnect', function() {
        console.log('User Disconnected: ', usersOnline[socket.id]);
        delete usersOnline[socket.id];
        io.emit("update-users", usersOnline);
    });
});
