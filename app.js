/**
 * @author Marco Gregory
 * 
 * Ponderous man: a discord presence-based queueing bot.
 * 
 * Version 1.0: First test
 * 
 * End goal: 
 * 
 * A bot that lets you immediately find people using the service who are LFG in the game you are playing
 * 
 */

const Discord = require('discord.js')
const { TOKEN } = require('./config') //My bot's auth token
const client = new Discord.Client()
const commandp = '~' //command to listen on
subscribers = []
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
    cmd = message.content.trim().substring(1).split(" ", 1)[0];
    //commands that do not require them to be playing a game
    switch(cmd){
        case 'ping':    
                        pong(message)
                        break;
        case 'registerchannel': 
                        registerChannel(message)
                        break;
        case 'help':    
                        helpMessage(message)
                        break;
        case 'unregisterchannel': 
                        unregisterChannel(message)
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
                        updateSubscribers(message, cmd);
                        break;
        case 'dequeue': 
                        dequeueUser(message);
                        updateSubscribers(message, cmd);
                        break;
        case 'queuestatus': 
                        displayQueueStatus(message);
                        break;
    }
}
//sends message based on cmd to all subscribed channels
function updateSubscribers(message, cmd){
    game = message.author.presence.game;
    gamesubs = subscribers[game];
    if(typeof gamesubs === 'undefined'){
        return;
    }
    action = '';
    switch(cmd){
        case 'enqueue': action = ' added themselves to the ' + game + ' queue'; break;
        case 'dequeue': action = ' removed themselves from the ' + game  + ' queue'; break;
        default: return;
    }
    for(var i = 0; i < gamesubs.length; i++){
        client.channels.get(gamesubs[i]).send(message.author.username + action);
    }
}
//help message
function helpMessage(message){
    message.channel.send('Current command to listen for: ' + commandp + "\nCommand list:\nping\n\tpong\nregisterchannel <channelID> <game title>\n\tRegister a channel to output changes to a game\'s queue. You can get your channel id using developer mode.\nhelp\n\tprints the help message\nenqueue\n\tPuts you into the queue for whatever game you are playing. You can only enter a queue once and you must be playing a game to do so.\ndequeue\n\tRemoves you from the queue for whatever game you are playing.\nqueuestatus\n\tDisplays the status of the queue for whatever game you are playing.\nunregisterchannel <channelID> <game title>\n\tUnsubscribe a channel from changes to a game\'s queue.");
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
    message.channel.send('Putting ' + person.username + ' into the ' + game + ' queue');
    queue[game].push([person.username, person.discriminator]);
    //describe the queue
    displayQueueStatus(message)
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
}
//display the status for the queue of the game they are playing
function displayQueueStatus(message){
    game = message.author.presence.game;
    msg = game + ' LFG queue:\n'
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
//returns true/false whether or not the sender of the message is admin on the server they sent it on
async function isAdmin(message){
    if(!(message.guild.available)) return false;
    let member = await message.guild.fetchMember(message.author)
    if(member === 'undefined'){
        message.channel.send('Failed to evaluate this user\'s permissions.')
        return false;
    }
    mp = member.hasPermission(0x00000008);
    if(!mp){
        message.channel.send('You are not an administrator. Only server admins are allowed to do this.');
        return false;
    }
    return true;
}
//register a channel to a game and update that channel whenever someone does something to that queue
async function registerChannel(message) {
    //verify permissions before people register a channel
    if(!isAdmin) return;

    channelToRegister = message.content.trim().split(" ", 2)[1];
    gameToRegister = message.content.trim().split(" ", 3)[2];    
    if(typeof channelToRegister === 'undefined' || typeof client.channels.get(channelToRegister) === 'undefined'){
        message.channel.send('Incorrect channel id');
        return;
    }
    if(typeof gameToRegister === 'undefined' || typeof queue[gameToRegister] === 'undefined'){
        message.channel.send('That game has not yet been registered. If someone plays this game I will allow you to register it.');
        return;
    }

    //make sure they are not already in the queue
    if(typeof subscribers[gameToRegister] === 'undefined') subscribers[gameToRegister]=[]
    var inqueue = subscribers[gameToRegister].findIndex(function(el) {
        return el = channelToRegister;
    });
    if(!(inqueue === -1)) {
        message.channel.send('You\'re already in the ' + gameToRegister + ' queue');
        return;
    }
    client.channels.get(channelToRegister).send(':thinking: aloud on this channel\nWhen there is a change to the ' + gameToRegister + ' queue it will be posted here')
    subscribers[gameToRegister].push(channelToRegister);
}
//unregister a channel from the subscription list
async function unregisterChannel(message){
    if(!isAdmin(message)) return;
    channelToRegister = message.content.trim().split(" ", 2)[1];
    gameToRegister = message.content.trim().split(" ", 3)[2];    
    if(typeof channelToRegister === 'undefined' || typeof client.channels.get(channelToRegister) === 'undefined'){
        message.channel.send('Incorrect channel id');
        return;
    }
    if(typeof gameToRegister === 'undefined' || typeof queue[gameToRegister] === 'undefined'){
        message.channel.send('That game has not yet been registered. If someone plays this game I will allow you to register it.');
        return;
    }
    var inqueue = subscribers[gameToRegister].findIndex(function(el) {
        return el = channelToRegister;
    });
    if(!(inqueue === -1)) {
        message.channel.send('Removing you from the ' + gameToRegister + ' subscription');
        subscribers[gameToRegister].splice(inqueue, 1);
        return;
    } else {
        message.channel.send('There is no ' + gameToRegister + ' subscription registered for this channel');
    }
}
//log in to the server
client.login(TOKEN)