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

var users = {};
var userPlaying = {};
var numPlayers = 0;
var roundStarted = false;
var picked = "";
var x = 0;

/* http://stackoverflow.com/questions/2532218/pick-random-property-from-a-javascript-object/15106541 */
function pickRandomProperty() {
    var result;
    var count = 0;
    for (var prop in users)
        if (Math.random() < 1/++count)
           result = prop;
    return result;
}

// Socket.io 
io.on('connection', function(socket){
 
    socket.on("join", function(username, callback){
        users[socket.id] = username;
        console.log(users[socket.id] + ' has connected ' + socket.id);

        numPlayers += 1;

        if(roundStarted === false)
        {
            if(numPlayers >= 6)
            {

                roundStarted = true;

                for (i = 0; i < 5; i++) //pick 5 random users
                {
                    var already_picked = true;
                    

                    while(already_picked === true)
                    {
                        var broke = false;
                        picked = pickRandomProperty();
                        for(var k in userPlaying)
                        {                        
                            if(userPlaying.hasOwnProperty(k))
                            {
                                if(userPlaying[k] === picked)
                                {
                                    broke = true;
                                    break;
                                }
                            }
                        }
                        if(broke === false)
                        {
                            already_picked = false;
                            userPlaying[x] = picked;
                        }
                    }
                    console.log("picked: " + users[picked]);
                    userPlaying[x] = picked;
                    x += 1;
                }       
                for (var key in users) 
                {
                    var playing = false;
                    if (users.hasOwnProperty(key)) 
                    {
                        for(var key2 in userPlaying)
                        {

                            if(userPlaying.hasOwnProperty(key2))
                            {

                                if(key === userPlaying[key2])
                                {
                                    playing = true;
                                    io.to(key).emit("playing", users, userPlaying);
                                }
                            }
                        }
                    }
                    if(playing === false)
                    {
                        io.to(key).emit("spectating", users, userPlaying);
                    }
                }
            }
            else
            {
                socket.emit("waiting-room");
            }                
        }
        else
        {
            socket.emit("spectating", users, userPlaying);
        }
    });


    socket.on("disconnect", function(){
        console.log(users[socket.id] + " has left the server.");
        //io.emit("update-users", users[socket.id]);
        delete users[socket.id];
        //io.emit("update-people", users);
    });

});
