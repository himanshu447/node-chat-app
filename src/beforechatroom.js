const path = require('path');
const http = require('http');
const { generateMessage, generateLocationMessage } = require('../src/utils/messages');

const express = require('express');
const socketio = require('socket.io');

const Filter = require('bad-words');

const app = express();

//new way to create server if we not express do this beHide for us
//we use because we are use socket.io and socket constructor need server   
const server = http.createServer(app);
const io = socketio(server);

const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.json());
app.use(express.static(publicDirectoryPath));

// if server is connected with 5 client then this function is run 5 time
io.on('connection', (socket) => {
    console.log('New webSocket connection');

    /// it will emit data for specific single client or (particular single connection) with updated data
    //2 argument of emit method is anything such as String,object etc....
    //---------------------------Before generate message function ---------------------------------------------------
    //socket.emit('message', 'welcome!');

    // it will emit data for each and every active connection except current connection    
    //socket.broadcast.emit('message', 'A New user jointed!');

    //---------------------------After generate message function---------------------------------------------------
    /// it will emit data for specific single client or (particular single connection) with updated data
    socket.emit('message', generateMessage('welcome!'));

    // it will emit data for each and every active connection except current connection    
    socket.broadcast.emit('message', generateMessage('A New user jointed!'));


    socket.on('sendMessage', (msg, callbackForAcknowledgement) => {

        ///bed-word validations  
        const filter = new Filter();
        if (filter.isProfane(msg)) {
            return callbackForAcknowledgement('Bed-words not allowed!');
        }

        // it will emit data for each and every active connection with updated value    
        io.emit('message', generateMessage(msg));

        //this will take any number of arguments or no arguments also worked
        callbackForAcknowledgement();
    });

    socket.on('sendLocation', (location, callbackForAcknowledgement) => {
        const googleMapLink = `https://google.com/maps?q=${location.latitude},${location.longitude}`;

        io.emit('locationMessage', generateLocationMessage(googleMapLink));
        //socket.broadcast.emit('message',`location : ${location.latitude} , ${location.longitude}`);

        callbackForAcknowledgement();
    });

    ///inBuild event that will fire when user disconnect from server
    socket.on('disconnect', () => {
        io.emit('message', generateMessage('A user is Disconnected!'));
    });

});


//------------------------------------------COUNT APP ------------------------------------------------------

// let count = 0;

// // if server is connected with 5 client then this function is run 5 time
// io.on('connection', (socket) => {
//     console.log('New webSocket connection');

//     //server(emit) -> client (receive) - countUpdate
//     socket.emit('countUpdated', count);

//     //client(emit) -> server (receive) - increment
//     socket.on('increment', () => {
//         count++;
//         /// it will emit data for specific single client or (particular single connection) with updated data
//         //client means browser
//             //socket.emit('countUpdated', count);

//         // it will emit data for each and every active connection with updated value    
//         io.emit('countUpdated', count);
//     })
// });


server.listen(process.env.PORT, () => {
    console.log('Server started at', process.env.PORT);
});