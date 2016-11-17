var config = {};

// Add bot token.
config.token = "";

// Your username. Do not read your own messages.
config.username = "";

// Language id
config.lang = "en";

// Word speed, a bit funky.
// Check google-tts-api for help
config.speed = 1;

// List of word replacements
config.replace = {
    "brb":  "be right back"
}

// Commands, write in any bot chat
config.commands = {
    "start": "1",
    "stop":  "0"
}

// Language
config.language = {
    "sent-link": "a link was sent",
    "left":      "left a group or a channel. Restart!",
    "joined":    "was added to a group or a channel. Restart!",
    "hello":     "singed in on team",
    "start":     "Listening",
    "stop":      "Stopped listening"
}

module.exports = config;
