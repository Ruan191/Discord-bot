const Discord = require('discord.js');
const {prefix, token, levelUpImage, AntiSpam} = require('./config.json');
const commands = require("./commands.js");
const um = require("./userManagement.js");

const client = new Discord.Client();

client.once('ready', () => {
    um.db;
    commands.loadHash();

    client.channels.holds.length

    client.users.cache.array().forEach(ele => {
        um.addUser(ele.id); //Adds new members to the database
    });
	console.log('Ready!');   
});

var timeSinceLastMsg = Date.now();
var spamCount = 0;

client.on("message", msg => {
    var words = msg.content.split(' ');
    const hasBotPerms = msg.member.hasPermission('BAN_MEMBERS', {checkAdmin: true});

    const secPassed = (Date.now() - timeSinceLastMsg) / 1000;
    timeSinceLastMsg = Date.now();
    
    //#region Features
    //#region Anti-spam
    if (secPassed < AntiSpam.timeToSpamCount){
        spamCount++;
    }else{
        spamCount = 0;
    }
    
    if (spamCount >= AntiSpam.spamAmmountToTrigger && AntiSpam.enabled){
        msg.channel.setRateLimitPerUser(AntiSpam.timePerMsg, 'Spam')
        setTimeout(() => {
            msg.channel.setRateLimitPerUser(0, 'Spam')
            spamCount = 0;
        }, AntiSpam.lifeTime)
    }
    //#endregion
    //#region Commands
    if (!msg.author.bot && msg.content.startsWith(prefix)){

        if (!commands.isValid(msg)){
            msg.reply('Please enter a valid command');
            return null;
        }

        commands.run(commands.cmd, msg, hasBotPerms, () => {
            msg.reply("You can't use this command!");
        });    
    }
    //#endregion
    //#region BannableWords
    if(!msg.author.bot){
        for (let i = 0; i < words.length; i++){
            if (!hasBotPerms)
                if (commands.hash.textExist(words[i].toLowerCase())){
                    msg.delete();
                    msg.reply('Hey! That word is not allowed!');
                    break;
                }        
        }
        //#endregion
    //#region Level up system
        const id = msg.author.id;
        um.addXPToUser(id, words.length);

        um.getUserXP(id, (xp) => {
            um.getXPRequired(id, (required) => {
                if (xp >= required){
                    const embed = new Discord.MessageEmbed()    
                    .setTitle(msg.author.username + ', lvl up!')
                    .setImage(levelUpImage)
                    .setColor('#0099ff');
                    
                    msg.reply(embed);
                    um.levelUP(id);
                }
            })
        });
    //#endregion
    }
    //#endregion
});

client.on('guildMemberAdd', (gm) => {
    um.addUser(gm.user.id);
})

client.login(token);
