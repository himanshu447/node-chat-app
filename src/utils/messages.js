const generateMessage = (text,username) => {
    return {
        text,
        createdAt: new Date().getTime(),
        username,
    }
};

const generateLocationMessage = (text,username) => {
    return {
        url: text,
        createdAt: new Date().getTime(),
        username,
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage,
};