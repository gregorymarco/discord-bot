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
 * todo: search for items in queue in a way that doesn't give me cancer
 * todo: route all message requests 
 * todo: register a channel to which I can send pretty messages/update frequently to display the queues
 * 
 */
const Discord = require('discord.js')
const { TOKEN } = require('./config') //My bot's auth token
const client = new Discord.Client()
const commandp = '~'
queue = []



//on launch
client.on('ready', () => {
    console.log("Connected as " + client.user.tag)
})


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

//put user into queue
client.on('message', message => {
    if(message.content.trim().startsWith(commandp+'enqueue')){
        person = message.author;
        game = person.presence.game;
        if(typeof game === 'undefined'){
            message.channel.send('You aren\'t in a game');
            return;
        }
        //no duplicates
        if(typeof(queue[game]) === 'undefined') {
            queue[game]=[];
        } else {
            for (var i = 0; i < queue[game].length; i++){
                if(queue[game][i][0] == person.username){
                    message.channel.send('You\'re already in the ' + game + ' queue');
                    return;
                }
            }
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
});

//remove user from queue
client.on('message', message => {
    game = message.author.presence.game;
    tmp = 0;
    if(message.content.trim() === commandp+'dequeue'){
        for (var i = 0; i < queue[game].length; i++){
            if(queue[game][i][0] == person.username){
                tmp = i;
                break;
            }
        }
        message.channel.send('Removed you from the ' + game + ' queue');
        queue[game].splice(tmp, 1);
        return;
    }
});

client.on('message', message => {
    game = message.author.presence.game;
    if(message.content.trim() === commandp+'queuestatus'){
        msg = game + ' LFG queue:'
        for (var i = 0; i < queue[game].length; i++){
            msg += queue[game][i][0] + '#' + queue[game][i][1] + '\n'
        }
        message.channel.send(msg);
    }
});

//ping pong
// client.on('message', message => {
//     if(message.content.trim() === commandp+'ping'){
//         message.channel.send('pong');
//         return;
//     }
// });

client.login(TOKEN)