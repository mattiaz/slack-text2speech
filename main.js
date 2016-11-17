//
//  HELPER FUNCTIONS
//

// Replace function
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

// Read functiuon, reads text
function read(message) {

    // Get the message and get "mp3" url from google translate
    // With the correct language

    tts(message, config.lang, config.speed)
    // If successful
    .then(function (url) {

        // Make a https request to download the file
        var request = https.get(url, function(response) {
            
            // Once downloaded pipe pirectly to a decoder
            response.pipe(new lame.Decoder())
            // Once decoded pipe it to a speaker
            .on('format', function (format) {
                this.pipe(new Speaker(format));
            });

        });

    })
    // Something went wrong
    .catch(function (err) {
        console.error(err.stack);
    });
}

//
//  REQUIRE
//

var RTM_CLIENT_EVENTS   = require('@slack/client').CLIENT_EVENTS.RTM;
var CLIENT_EVENTS       = require('@slack/client').CLIENT_EVENTS;
var RTM_EVENTS          = require('@slack/client').RTM_EVENTS;
var RtmClient           = require('@slack/client').RtmClient;
var Speaker             = require('speaker');
var config              = require('./config.js');
var https               = require('https');
var lame                = require('lame');
var tts                 = require('google-tts-api');

//
//  VARIABLES
//

// Slack client
var slack = new RtmClient(config.token);
// Start
slack.start();

// Bot Name, get from token
var name = "";
// Bot Team
var team = "";
// If **required** to exit
var exit = false;
// Read messages on / off
var running = false;

//
//  STARTUP
//

// Online
slack.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (rtmStartData) {
    
    // Get name and team
    name = rtmStartData.self.name;
    team = rtmStartData.team.name;

    // Log greetings message
    console.log(name + " " + config.language["hello"]+  " " + team + ".");
    running = true;

});

// If joined new channel
slack.on(RTM_EVENTS.CHANNEL_JOINED, function (message) {

    // Need to exit
    exit = true;

    console.log(name + " " + config.language["joined"]);
           read(name + " " + config.language["joined"]);
    
});

// If left channel
slack.on(RTM_EVENTS.CHANNEL_LEFT, function (message) {

    // Need to exit
    exit = true;

    console.log(name + " " + config.language["left"]);
           read(name + " " + config.language["left"]);
});

// New message
slack.on(RTM_EVENTS.MESSAGE, function (message) {

    // Make sure it's a message and not in exit mode
    if(message.type != "message" || exit)
        return;

    // Something might go wrong, just ignore it
    try{

        // Get the message text
        var msg = message.text;
        // Get the username
        var user = slack.dataStore.getUserById(message.user);
        // Get channel, group or dm
        var channel = slack.dataStore.getChannelById(message.channel);
        var group = slack.dataStore.getGroupById(message.channel);
        var dm = slack.dataStore.getDMById(message.channel);

        // You talking to the bot
        if(dm != undefined && config.username == user.name){
            checkArgs(msg, user.name)
        }

        // Other people talking in a channel or group
        if(channel != undefined || group != undefined && config.username != user.name){
            
            // Regex to check if message contains a url
            if(new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?").test(msg)) {
                // Replace the message with a new one. From config
                msg = config.language["sent-link"];
            }
            else{
                for (var i in config.replace) {
                    msg = msg.replaceAll(i, config.replace[i]);
                }
            }

            // Make sure bot is in listen mode
            if(running){
                read(msg);
            }
        }
    }
    catch(e){
    }

});

//
//  CONSOLE COMMANDS
//

function checkArgs(msg, user) {

    if(msg.toLowerCase() == config.commands["start"]){

        read(config.language["start"]);
        console.log(config.language["start"]);
        running = true;

    }

    else if(msg.toLowerCase() == config.commands["stop"]){

        read(config.language["stop"]);
        console.log(config.language["stop"]);
        running = false;

    }

    else{
        read(msg);
    }
}
