const sqlite =  require('sqlite3').verbose();

let db = new sqlite.Database('./users.db', sqlite.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the users database.');
})

async function getUserXP(id, callback){
    db.get(`SELECT XP FROM UserInfo WHERE UserID = ${id};`, (err, row) => {
        if (err)
            console.log(err);
        else
            callback(row.XP);
    });
}

function getXPRequired(id, callback){
    db.get(`SELECT LvlUpAt FROM UserInfo WHERE UserID = ${id};`, (err, row) => {
        if (err)
            console.log(err);
        else callback(row.LvlUpAt);
    });
}

function getLvl(id, callback){
    db.get(`SELECT lvl FROM UserInfo WHERE UserID = ${id};`, (err, row) => {
        if (err)
            console.log(err);
        else callback(row.lvl);
    });
}

function levelUP(id){
    var myPromise = new Promise((resolve, reject) => {
        db.get(updateRow(id, 'lvl', '+1'));
        if (resolve){
            resolve('hey');
            
        }else {
            reject('bye')
        }
    })

    myPromise.then(((value) =>{console.log(value);db.get(updateRow(id, 'LvlUpAt', `*(1 + ${getValue(id,'lvl')})`));})).catch(err => {console.log(err);});
}

function addXPToUser(id = 0, xpAmount = 0){
    db.exec(`UPDATE UserInfo SET XP = (SELECT XP FROM UserInfo WHERE UserID = ${id}) + ${xpAmount},MessageCount = (SELECT MessageCount FROM UserInfo WHERE UserID = ${id}) + 1 WHERE UserID = ${id};`);
}

function addUser(id){
    db.exec(`INSERT INTO UserInfo VALUES (${id}, 0, 0, 0, 0, 20);`, (statement, err) => {
        if(err)
            return null;
    });
}

function removeUser(id){
    db.exec(`DELETE FROM UserInfo WHERE UserID = ${id};`)
}

function clear(){
    db.exec(`DELETE FROM UserInfo;`)
}

function updateRow(id, cell, value){
    return `UPDATE UserInfo SET ${cell} = (SELECT ${cell} FROM UserInfo WHERE UserID = ${id}) ${value} WHERE UserID = ${id};`;
}

function getValue(id, cell){
    return `(SELECT ${cell} FROM UserInfo WHERE UserID = ${id})`;
}

module.exports = {
    db: db,
    sqlite: sqlite,
    getUserXP: getUserXP,
    addUser: addUser,
    removeUser:removeUser,
    clear:clear,
    addXPToUser: addXPToUser,
    getXPRequired: getXPRequired,
    levelUP: levelUP,
    getLvl: getLvl
}