var express = require('express'),
    http = require('http'),
    bodyParser = require('body-parser'),
    app = express(),
    //redis = require('redis'),
    mongoose = require('mongoose'),
    mongodb = require('mongodb'),
    MongoClient = mongodb.MongoClient,
    fs = require('fs'),
    io = require('socket.io'),
    player = require('play-sound')(opts = {});

var userPlaying = {};
var spectators = {};

//client = redis.createClient();

//client.on('connect', function() {
    //console.log('connected');
//});

var count = 0;

var imagePath = '/public/imagesForDB/baby_stroller.jpg'

//Connect to the database
mongoose.Promise = global.Promise;

var db = mongoose.connection;
mongoose.connect('mongodb://localhost:27017/pricesDB');
db.on('error', console.error);
db.once('open', function() {
    console.log("Connected to database");
    console.log("Populating the database");
	
    var collection = db.collection('items');

    //http://stackoverflow.com/questions/2727167/getting-all-filenames-in-a-directory-with-node-js
    //GET file names and store each file name as a string to add to the database
    var test = './public/imagesForDB';
    fs.readdir(test, (err, files) => {
        files.forEach(file => {
    	    
            //console.log(file);
            //-------------------------------------------------------------
    	    //parse logic string for price
    	    var price = file.split("$");
    	    //we only care about the second part of object since result is 2 objects e.g [<itemname> , <price>]
    	    price = price[1];
    	    var i = 0;
    	    var parsedPrice = "";
    	    while (price[i] != 'j')
    	    {
    	        parsedPrice += price[i];
    	        i++;
    	    }
    	    parsedPrice = parsedPrice.slice(0, -1);
    	    //--------------------------------------------------------------

    	    console.log(parsedPrice);
    	    count += 1;
    	    var path = '/public/imagesForDB/';
    	    var imagePath = path+file;
    	    var input = {
                "image": imagePath,
                "price": parsedPrice,
                "id": count
            };

            collection.insert([input], function(err, result) {
                if (err) {
                    console.log(err);
                }
            });	
        });
    })
    console.log("Database Populated");

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
