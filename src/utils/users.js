const users = [];

// add user, remove user getUser getUserInRooms

//destructuring the property of object({id,username,room})
//here id room and username is example of destructuring of object
const addUser = ({ id, username, room }) => {

    //clean data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    //validation
    if (!username || !room) {
        return {
            error: 'Username and Room are required!'
        }
    }

    //check for existing user
    const existingUser = users.find((user) => user.room === room && user.username === username);

    //validate username
    if (existingUser) {
        return {
            error: 'Username is in use!'
        }
    }

    //store user
    const user = { id, username, room };
    users.push(user);
    return { user };
}

const removeUser = (id) => {

    const index = users.findIndex((user) => user.id === id);

    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id);
}

const getUsersInRoom = (room) => {
    return users.filter((user) => user.room === room);
}

module.exports = {
    getUser,
    getUsersInRoom,
    addUser,
    removeUser,
}