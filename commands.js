const Discord = require('discord.js');
const {commands, prefix} = require('./config.json');
var fs = require("fs");
const {token} = require('./config.json');
const um = require("./userManagement.js");

const bLocation = "blackListedWords.csv";

const {HashMap} = require("./hashMap.js");
const { rejects } = require('assert');
const client = new Discord.Client();
client.login(token);

const hash = new HashMap(1000,10);

module.exports = {
    //commands
    cmd: null,
    hash: hash,
    getBlackList: function(){return getBlackList()},

    run(cmd, msg, hasPerm, onPermFail){
        switch(cmd){
            case commands[0]:
                permNeeded(true, hasPerm, () => {say(msg);}, onPermFail); 
                break;
            case commands[1]:
                permNeeded(true, hasPerm, () => {blackList(msg);}, onPermFail);
                break;
            case commands[2]:
                permNeeded(true, hasPerm, () => {showBlackList(msg);}, onPermFail);
                break;
            case commands[3]:
                permNeeded(true, hasPerm, () => {help(msg);}, onPermFail);
                break;
            case commands[4]:
                dLvl(msg);
                break;
            case commands[5]:
                permNeeded(true, hasPerm, () => {performTaskOnMember(msg);}, onPermFail)
                break;
        }
    },

    isValid: function(msg){
        for (let i = 0; i < commands.length; i++){
            if (msg.content.substring(0,commands[i].length + 1) == prefix + commands[i]){
                this.cmd = commands[i];  
                return true;
            }    
        }
        return false;
    },

    loadHash: function(){loadHash();}
}

function getBlackList(){return txt = fs.readFileSync(bLocation, 'utf8').toString().split(',')}

function say(msg){
    var txts = msg.content.split(' ');
    var txt = '';
    
    for (var i = 1; i < txts.length; i++){
        txt += ' ' + txts[i];
    }
    msg.channel.send(txt);
}

function blackList(msg){
    var txts = msg.content.split(',');

    for (var i = 1; i < txts.length; i++){
        fs.appendFileSync(bLocation, txts[i] + ',')       
    }
    
    loadHash();
}

function showBlackList(msg){
    var txts = null;
    getBlackList().forEach(element => {
        txts += ' | ' + element;
    });

    const embed = new Discord.MessageEmbed()    
    .setTitle('Black Listed Words')
    .addFields({ name: 'Words', value: txts, inline: true})
    .setColor('#0099ff');

    msg.channel.send(embed);
}

function loadHash(){
    getBlackList().forEach(element => {
        hash.load(element);
    });
}

function help(msg){
    var commandOptions = "";
    commands.forEach((str) => {
        commandOptions += ' | ' + str;
    })

    const embed = new Discord.MessageEmbed()    
    .setTitle('List Of Commands')
    .addFields({ name: 'Commands', value: commandOptions, inline: true})
    .setColor('#0099ff');

    msg.channel.send(embed);
}

function dLvl(msg){
    const m = msg.content.split(' ');

    let pingedMsgId = null;
    let user = null;

    if (m[1] == undefined || m[1] == ''){
        pingedMsgId = msg.author.id;
        user = msg.author;
    }else{
        pingedMsgId = getPingId(m[1]);
        user = client.users.cache.array().find(user => user.id === pingedMsgId);
    }

    um.getLvl(pingedMsgId, (lvl) => {
        um.getXPRequired(pingedMsgId, (xpNeeded) => {
            um.getUserXP(pingedMsgId, (xp) => {
                const embed = new Discord.MessageEmbed()
                .setThumbnail(user.avatarURL())
                .setTitle(user.username)
                .addFields({ name: 'lvl', value: lvl, inline: true},  {name: 'xp', value: `${xp} / ${xpNeeded}`, inline: true})
                .setColor('#0099ff');

                msg.channel.send(embed);
            })
        })
    })
}

function permNeeded(needPerm = true, hasPerm, func, onFail){
    if (needPerm){
        if (hasPerm){
            func();
        }else{
            onFail();
        }
    }else{
        func();
    }
}

function msgBlock(str, syn = ""){return '```' + syn + '\n'+ str + '```'}

function getPingId(str = ""){
    return str.replace('<@!', '').replace('>', '');
}

function performTaskOnMember(msg = new Discord.Message){
    const m = msg.content.split(' ');
    const userId = getPingId(m[2]);
    const task = m[1];

    msg.guild.members.fetch(userId).then((user) => {
        switch (task) {
            case 'kick':
                user.kick();
                break;
            case 'ban':
                user.ban();
                break;
            case 'mute':
                user.roles.add(getRole('Muted', msg.guild));
                break;
            case 'unmute':
                user.roles.remove(getRole('Muted', msg.guild));
            default:
                break;
        }
    });
}

function getRole(role = "", g = new Discord.Guild){
    return g.roles.cache.find(a => a.name === role);    
}