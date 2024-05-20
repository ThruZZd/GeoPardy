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

//Set static
app.use(express.static(path.join(__dirname, 'public')));

//Run on client connect
io.on('connection', socket=>{
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
    
})




const PORT = 10000 || process.env.PORT;

server.listen(PORT, ()=>console.log("Server running on "+PORT));