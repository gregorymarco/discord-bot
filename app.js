/**
 * @author Marco Gregory
 * 
 * Ponderous man: a discord presence-based queueing bot.
 * 
 * Version 0.1
 * 
 * End goal: 
 * 
 * A bot that lets you immediately find people on your friends list who are LFG
 * 
 * todo: register a channel to which I can send pretty messages/update frequently to display the queues
 * 
 */

// client.on('message', message => {
//     if(message.content.trim().startsWith(commandp+'register')){
//         channelToRegister = message.content.trim().split(" ", 2)[1];
//         if(typeof channelToRegister === 'undefined' || typeof client.channels.get(channelToRegister) === 'undefined'){
//             message.channel.send('Incorrect channel id');
//             return;
//         }
//         client.channels.get(channelToRegister).send(':thinking: aloud on this channel')
//         channellist += channelToRegister
//     }
// });

const Discord = require('discord.js')
const { TOKEN } = require('./config') //My bot's auth token
const client = new Discord.Client()
const commandp = '~' //command to listen on
queue = []

//on launch: console print to lmk that it's running
client.on('ready', () => {
    console.log("Connected as " + client.user.tag)
})

//routes all messages that the bot will see
client.on('message', message => {
    moreEfficientMessageRouter(message);
});

//router for all messages for the bot
function moreEfficientMessageRouter(message) {
    //check to see if their message starts with the command to respond to
    if(!(message.content.trim().startsWith(commandp))){
        return;
    }
    //check to see that their message is in my set of commands
    cmd = message.content.trim().substring(1);    
    //commands that do not require them to be playing a game
    switch(cmd){
        case 'ping':    pong(message)
                        break;
    }
    //these commands that require the rich presence game to be active
    game = message.author.presence.game;
    if(game === 'undefined'){
        message.channel.send('You aren\'t in a game');
        return;
    }
    //if they are playing an unknown game, regsiter that game's info here
    if(typeof queue[game] === 'undefined') {
        queue[game] = [];
    }
    //rich presence game-requiring commands
    switch(cmd){
        case 'enqueue': 
                        enqueueUser(message);
                        break;
        case 'dequeue': 
                        dequeueUser(message);
                        break;
        case 'queuestatus': 
                        displayQueueStatus(message);
                        break;
    }
}

//put the user in the queue of whatever game they are playing
function enqueueUser(message){
    person = message.author;
    game = person.presence.game;
    //make sure they are not already in the queue
    var inqueue = queue[game].findIndex(function(el) {
        return el = [person.username, person.discriminator]
    });
    if(!(inqueue === -1)) {
        message.channel.send('You\'re already in the ' + game + ' queue');
        return;
    }
    //describe the queue
    message.channel.send('Putting ' + person.username + ' into the ' + game + ' queue');
    queue[game].push([person.username, person.discriminator]);
    if(queue.length == 1){
        message.channel.send('You are the only person in the ' + game + ' queue');
    } else {
        peopleString = ''
        for (var i = 0; i < queue[game].length; i++){
            peopleString += queue[game][i][0] + '#' + queue[game][i][1] + '\n'
        }
        message.channel.send('Number of people in this queue:' + (queue[game].length) + '\nThey are:\n' + peopleString)
    }
}

//remove the user from the queue for whatever game they are playing
function dequeueUser(message){
    person = message.author;
    game = message.author.presence.game;
    //find them in the queue in a way that doesn't make my eyes bleed
    var inqueue = queue[game].findIndex(function(el) {
        return el = [person.username, person.discriminator]
    });
    if(inqueue === -1) {
        message.channel.send('You aren\'t in the ' + game + ' queue');
        return;
    }
    //remove them from the queue
    queue[game].splice(inqueue, 1);
    message.channel.send('Removed you from the ' + game + ' queue');
    return;
}

//display the status for the queue of the game they are playing
function displayQueueStatus(message){
    game = message.author.presence.game;
    msg = game + ' LFG queue:'
    for (var i = 0; i < queue[game].length; i++){
        msg += queue[game][i][0] + '#' + queue[game][i][1] + '\n'
    }
    message.channel.send(msg);
}

//ping
function pong(message){
        message.channel.send('pong');
        return;
}

//log in to the server 
client.login(TOKEN)