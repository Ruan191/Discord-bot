const Discord = require('discord.js');
const {commands, prefix} = require('./config.json');
var fs = require("fs");

const client = new Discord.Client();
const bLocation = "blackListedWords.csv";

const {HashMap} = require("./hashMap.js");

const hash = new HashMap(1000,10);

module.exports = {
    //commands
    cmd: null,
    hash: hash,
    getBlackList: function(){return getBlackList()},
        
    run(cmd, msg){
        switch(cmd){
            case commands[0]:
                say(msg);
                break;
            case commands[1]:
                blackList(msg);
                break;
            case commands[2]:
                showBlackList(msg);
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

    msg.channel.send('```' + txts + '```');
}

function loadHash(){
    getBlackList().forEach(element => {
        hash.load(element);
    });
}