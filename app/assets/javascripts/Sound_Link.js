//Play all and pause all, button
var button = document.getElementsByClassName('btn-play');
var button2 = document.getElementsByClassName('btn-pause');
var button3 = document.getElementsByClassName('btn-stop');
var player = document.getElementsByClassName('player');
var timeInput = document.getElementsByClassName('time');

window.addEventListener('load', function(){
    for(var b=0; b<button.length; b++){

        button[b].addEventListener('click', playTracks.bind(this, b));
        button2[b].addEventListener('click', pauseTracks.bind(this, b));
        button3[b].addEventListener('click', stopTracks.bind(this, b));
    };

});

//Inside playTracks function, I link players currentTime with inputs values to start playing
function playTracks(b){
    for(var t=0; t<player.length; t++){
        if(button[b].id == player[t].id && player[t].currentTime >= 0){
            player[t].currentTime = timeInput[t].value
            player[t].play()
        };
    };
};

function pauseTracks(b){
    for(var c=0; c<player.length; c++){
        player[c].pause();
        timeInput[c].value = player[c].currentTime     
    };
};

function stopTracks(b){
    for(var c=0; c<player.length; c++){
        player[c].pause();
        player[c].currentTime = 0; 
        timeInput[c].value = 0;   
    };
};
