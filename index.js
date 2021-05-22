const Discord = require('discord.js');
const {prefix, token, level_up, AntiSpam, bannable_words, commands} = require('./config.json');
const cmd = require("./commands.js");
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
    if (!msg.author.bot && msg.content.startsWith(prefix) && commands.enabled){

        if (!cmd.isValid(msg)){
            msg.reply(commands.wrong_command_msg);
            return null;
        }

        cmd.run(cmd.cmd, msg, hasBotPerms, () => {
            msg.reply(commands.perm_needed_msg);
        });    
    }
    //#endregion
    //#region BannableWords
    if(!msg.author.bot){
        if (bannable_words.enabled){
            for (let i = 0; i < words.length; i++){
                if (!hasBotPerms)
                    if (cmd.hash.textExist(words[i].toLowerCase())){
                        msg.delete();
                        msg.reply(bannable_words.reply);
                        break;
                    }        
            }
        }
        //#endregion
    //#region Level up system
        if (level_up.enabled){
            const id = msg.author.id;
            um.addXPToUser(id, words.length);
    
            um.getUserXP(id, (xp) => {
                um.getXPRequired(id, (required) => {
                    if (xp >= required){
                        const embed = new Discord.MessageEmbed()    
                        .setTitle(msg.author.username + ', lvl up!')
                        .setImage(level_up.img)
                        .setColor('#0099ff');
                        
                        msg.reply(embed);
                        um.levelUP(id);
                    }
                })
            });
        }
    //#endregion
    }
    //#endregion
});

client.on('guildMemberAdd', (gm) => {
    um.addUser(gm.user.id);
})

client.login(token);
