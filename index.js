const Discord = require('discord.js');
const {prefix, token} = require('./config.json');
const commands = require("./commands.js");
const um = require("./userManagement.js");
const perm = new Discord.Permissions();

const client = new Discord.Client();
const d = um.db;

client.once('ready', () => {
    um.db;
    commands.loadHash();

    client.channels.holds.length
    client.users.cache.array().forEach(ele => {um.addUser(ele.id);});
	console.log('Ready!');
});

client.on("message", msg => {
    var words = msg.content.split(' ');
    const hasBotPerms = msg.member.hasPermission('BAN_MEMBERS', {checkAdmin: true});

    if (!msg.author.bot && msg.content.startsWith(prefix) && hasBotPerms){

        if (!commands.isValid(msg)){
            msg.reply('Please enter a valid command');
            return null;
        }

        commands.run(commands.cmd, msg);
    }

    if(!msg.author.bot){

        for (let i = 0; i < words.length; i++){
            if (!hasBotPerms)
                if (commands.hash.textExist(words[i].toLowerCase())){
                    msg.delete();
                    msg.reply('Hey! That word is not allowed!');
                    break;
                }        
        }

        var id = msg.author.id;
        um.addXPToUser(id, words.length);

        um.getUserXP(id, (xp) => {
            um.getXPRequired(id, (required) => {
                if (xp >= required){
                    msg.channel.send('lvl up!');
                    msg.channel.send('https://tenor.com/view/cute-anime-dancing-silly-happy-excited-gif-13462237');
                    um.levelUP(id);
                }
            })
        });
    }
});

client.on('guildMemberAdd', (gm) => {
    um.addUser(gm.user.id);
})

client.login(token);
