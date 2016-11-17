var main = function() {
    'use strict';
    $('#sign-in-form').show();

    var socket = io.connect('http://localhost:3000', {
        reconnect: true
    });

    var audioElement = document.createElement('audio');
    audioElement.setAttribute('src', '/Price-is-right-losing-horn.mp3');

    var homePageAudio = document.createElement('audio');
    homePageAudio.setAttribute('src', '/price_is_right.mp3');
    
    audioElement.addEventListener('ended', function() {
        this.play();
    }, false)

    homePageAudio.addEventListener('ended', function() {
        this.play();
    }, false)

    homePageAudio.play();

    // Add New User
    $('#getUsername').on('click', function(event) {
        if ($('#usernameInput').val() !== '') {
            var username = $('#usernameInput').val();
            socket.emit('join', username);
            $('#userInputDiv').hide();
            $('#startNewRound').show();
            $('#answerForm').show();
            $('#newQuestionForm').show();
            $('#scoreArea').show();
        }
        return false;
    });

    // Update User List
    socket.on("update-users", function(user) {
        $("#users").empty();
        $.each(user, function(clientID, name) {
            $('#users').append("<li>" + name + "</li>");
        });
    });

    
    $('#startNewRound').on('click', function(event) {
        audioElement.play();
        return false;
    });
};

$(document).ready(main);
