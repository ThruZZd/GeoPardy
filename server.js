const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

var subOpen = true;
var revealed = false;
var rmarkers;

//Tobbs

const { Client } = require('pg');
const connection = {
    host: "ep-holy-sunset-a2kp46k9.eu-central-1.aws.neon.tech",
    user: "tobbsdb_owner",
    port: 5432,
    password: "4dajVHghY7XD",
    database: "tobbsdb",
    ssl: {
        rejectUnauthorized: false
    }
}






//Set static
app.use(express.static(path.join(__dirname, 'public')));

//Run on client connect
io.on('connection', async socket=>{
    if(revealed){
        socket.emit('reveal',rmarkers)
    }


    socket.on('postU', (posted)=>{

        io.emit('adminMarker', posted);
        

    })


    //Open Closed
    socket.on('isOpenI', (isO)=>{

        subOpen = isO;
        io.emit('isOpenO', subOpen);

    })

    //Reset
    socket.on('fullReset', ()=>{

        subOpen = true;
        revealed = false;
        markers=null;
        rmarkers=[];
        io.emit('fullResetC');

    })

    socket.on('revealA', (markers)=>{
        revealed = true;
        rmarkers = markers;
        
        io.emit('reveal', markers);

    })



    io.emit('isOpenO',subOpen);

    //Tobbs

    const suInfo = await getSetupInfo();
    socket.emit('setupNames',suInfo);

    const caInfo = await getCardInfo();
    socket.emit('setupCards', caInfo);

    const caAddInfo = await getCardInfoAdd();
    socket.emit('setupAddCards', caAddInfo);
    
    socket.on('requestSearch', (reqEl)=>{
        searchCards(reqEl);
    })

    socket.on('requestAdd', (cInfo)=>{
        addCardToDB(cInfo);
    })
    
})


async function getSetupInfo(){
    const client = new Client(connection);
    await client.connect();
    
    try {
        const res = await client.query('SELECT name FROM Users');
        return res.rows;
    } catch (err) {
        console.error('Query error', err.stack);
        return "Error";
    } finally {
        await client.end();
    }
}

async function getCardInfo(){
    const client = new Client(connection);
    await client.connect();
    
    try {
        const res = await client.query('SELECT distinct heftid FROM Cards ORDER BY heftid');
        return res.rows;
    } catch (err) {
        console.error('Query error', err.stack);
        return "Error";
    } finally {
        await client.end();
    }
}

async function getCardInfoAdd(){
    const client = new Client(connection);
    await client.connect();
    
    try {
        const res = await client.query('SELECT heftid,special FROM Cards ORDER BY heftid');
        return res.rows;
    } catch (err) {
        console.error('Query error', err.stack);
        return "Error";
    } finally {
        await client.end();
    }
}

async function searchCards(csObj){
    const user = csObj.user;
    const hid = csObj.heftid;
    var dupSubtract = 0;
    if(csObj.onlydups){
        dupSubtract = 1;
    }
    var query = ``;

    if(user === "Alle"){
        if(hid === ""){
            query = `SELECT u.name, uo.anzahl-`+dupSubtract+`, ca.heftid,ca.name_on,ca.special
            FROM Cards AS ca INNER JOIN user_owns AS uo ON ca.cid=uo.cid
            INNER JOIN Users AS u ON u.uid=uo.uid
            WHERE anzahl-`+dupSubtract+` > 0
            ORDER BY heftid asc`
        }else{
            query = `SELECT u.name, uo.anzahl-`+dupSubtract+`, ca.heftid,ca.name_on,ca.special
            FROM Cards AS ca INNER JOIN user_owns AS uo ON ca.cid=uo.cid
            INNER JOIN Users AS u ON u.uid=uo.uid
            WHERE anzahl-`+dupSubtract+` > 0 AND ca.heftid='`+hid+`'
            ORDER BY heftid asc`
        }
    }else{
        if(hid===""){
            query = `SELECT u.name, uo.anzahl-`+dupSubtract+`, ca.heftid,ca.name_on,ca.special
            FROM Cards AS ca INNER JOIN user_owns AS uo ON ca.cid=uo.cid
            INNER JOIN Users AS u ON u.uid=uo.uid
            WHERE anzahl-`+dupSubtract+` > 0 AND u.name='`+user+`'
            ORDER BY heftid asc`
        }else{
            query = `SELECT u.name, uo.anzahl-`+dupSubtract+`, ca.heftid,ca.name_on,ca.special
            FROM Cards AS ca INNER JOIN user_owns AS uo ON ca.cid=uo.cid
            INNER JOIN Users AS u ON u.uid=uo.uid
            WHERE anzahl-`+dupSubtract+` > 0 AND u.name='`+user+`' AND ca.heftid='`+hid+`'
            ORDER BY heftid asc`
        }
    }



    const client = new Client(connection);
    await client.connect();
    var returnval = "";
    
    try {
        const res = await client.query(query);
        returnval = res.rows;
        io.emit('searchResult',returnval);
    } catch (err) {
        console.error('Query error', err.stack);
        returnval = "Error";
    } finally {
        await client.end();
    }

    
}

async function addCardToDB(cInfo){
    const anzahl = cInfo.anzahl;
    const user = cInfo.user;
    const heftid=cInfo.heftid;
    const special=cInfo.special;
    var uid;
    var cid;

    //Get uid
    var client = new Client(connection);
    await client.connect();
    
    
    try {
        const res = await client.query(`SELECT uid FROM Users WHERE name='`+user+`'`);
        uid = res.rows.map(item=>item.uid)[0]
        
    } catch (err) {
        console.error('Query error', err.stack);
        
    } finally {
        await client.end();
    }

    //Get uid

    client = new Client(connection);
    await client.connect();
    
    
    try {
        const res = await client.query(`SELECT cid FROM Cards WHERE heftid='`+heftid+`' AND special='`+special+`'`);
        cid = res.rows.map(item=>item.cid)[0]
        
    } catch (err) {
        console.error('Query error', err.stack);
        
    } finally {
        await client.end();
    }

    //Insert Card

    client = new Client(connection);
    await client.connect();
    
    
    try {
        const res = await client.query(`INSERT INTO user_owns (uid,anzahl,cid)
        VALUES (`+uid+`, `+anzahl+`, `+cid+`)
        ON CONFLICT (uid, cid)
        DO UPDATE SET anzahl = user_owns.anzahl + EXCLUDED.anzahl`);
        cid = res.rows.map(item=>item.cid)[0]
        
    } catch (err) {
        console.error('Query error', err.stack);
        
    } finally {
        await client.end();
    }

}



const PORT = 10000 || process.env.PORT;

server.listen(PORT, ()=>console.log("Server running on "+PORT));