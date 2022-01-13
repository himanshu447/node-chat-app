const path = require('path');
const http = require('http');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { getUser, getUsersInRoom, addUser, removeUser } = require('./utils/users');
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
    //socket.emit('message', generateMessage('welcome!'));

    // it will emit data for each and every active connection except current connection    
    //socket.broadcast.emit('message', generateMessage('A New user jointed!'));

    socket.on('join', ({ username, room }, acknowledgementCallback) => {

        //before joint the room
        //add user in array for track and validate user
        const { error, user } = addUser({ id: socket.id, username, room })

        if (error) {
            return acknowledgementCallback(error);
        }

        //is a socket method which create room in server and specifliclly emit and listen data for that room only
        socket.join(user.room);

        //without room
        //socket.emit , io.emit , socket.broadcast.emit

        //with room (specific room)
        //io.to.emit :- it will emit the data for each and every client inside the same room(not other room)
        //socket.broadcast.to.emit :- it will emit the data for all client in same room except current client   

        socket.emit('message', generateMessage('welcome!', 'Admin'));
        // it will emit data for each and every active connection except current connection    
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has jointed!`, 'Admin'));

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room),
        });

        acknowledgementCallback();
    });

    socket.on('sendMessage', (msg, callbackForAcknowledgement) => {

        ///bed-word validations  
        const filter = new Filter();
        if (filter.isProfane(msg)) {
            return callbackForAcknowledgement('Bed-words not allowed!');
        }

        const user = getUser(socket.id);

        if (!user) {
            return callbackForAcknowledgement('User not found');
        }

        // it will emit data for each and every active connection with updated value    
        io.to(user.room).emit('message', generateMessage(msg, user.username));

        //this will take any number of arguments or no arguments also worked
        callbackForAcknowledgement();
    });

    socket.on('sendLocation', (location, callbackForAcknowledgement) => {
        const googleMapLink = `https://google.com/maps?q=${location.latitude},${location.longitude}`;

        const user = getUser(socket.id);
        if (!user) {
            return callbackForAcknowledgement('User not found');
        }
        io.to(user.room).emit('locationMessage', generateLocationMessage(googleMapLink, user.username));
        //socket.broadcast.emit('message',`location : ${location.latitude} , ${location.longitude}`);

        callbackForAcknowledgement();
    });

    ///inBuild event that will fire when user disconnect from server
    socket.on('disconnect', () => {

        //remove user from Array to not tracking
        const user = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('message', generateMessage(`${user.username} is Disconnected!`, 'Admin'));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room),
            });
        }


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