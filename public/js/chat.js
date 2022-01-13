const socket = io()


//Elements
const $messageForm = document.querySelector('form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');

const $locationButton = document.querySelector('#location');

const $messages = document.querySelector('#messages');

const $sidebar = document.querySelector('#sidebar');

//Template
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML;
const sideBarTemplate = document.querySelector('#sidebar-template').innerHTML;

//options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

//scrolling function
const autoScroll = () => {
    
    //New message element
    const $newMessage = $messages.lastElementChild 

    //Height of the new message
    const newMessageStyle = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    //Height of message container
    const containerHeight = $messages.scrollHeight

    //How far have i scrolled?
    const scrollOffset = $messageForm.scrollTo + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTo = $messages.scrollHeight
    }
}

socket.on('message', (msg) => {
    console.log(msg);

    //render method take 2 parameter as data 
    //it will take data in form of key value pair 
    //where key is same as display in Html file inside <script id="message-template" type="text/html">
    const html = Mustache.render(messageTemplate, {
        message: msg.text,
        createdAt: moment(msg.createdAt).format('h:mm a'),
        username: msg.username,
    });

    //To display the text inside Div
    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
});

socket.on('locationMessage', (locationMsg) => {
    const html = Mustache.render(locationMessageTemplate, {
        locationLink: locationMsg,
        createdAt: moment(locationMsg.createdAt).format('hh:mm a'),
        username: locationMsg.username,
    });

    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
});

socket.on('roomData', (roomData) => {
    const html = Mustache.render(sideBarTemplate, {
        room: roomData.room,
        users: roomData.users
    });

    $sidebar.innerHTML = html;

});

$messageForm.addEventListener('submit', (e) => {
    // this is because prevent default behaviour of browser that will refresh the page after click
    e.preventDefault();

    //disable button
    $messageFormButton.setAttribute('disabled', 'disabled');

    //get value by name from input controller
    const userTypedMsg = e.target.elements.message.value;
    socket.emit('sendMessage',
        userTypedMsg,
        (error) => {

            //this is acknowledgement so this acknowledgement message 
            //will display Or work only to the current client Console only

            //enable button
            $messageFormButton.removeAttribute('disabled');

            //clear input filed
            $messageFormInput.value = '';
            $messageFormInput.focus();


            if (error) {
                alert(error);
                location.href = '/';
                return console.log(error);
            }

            console.log('This is acknowledge callBack The Message was delivered! This is call when server call the callback of acknowledge');
        });
});

$locationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser!');
    }

    //disable location button
    $locationButton.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation',
            {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            }, () => {
                //this is acknowledgement so this acknowledgement message will display to the current client only

                //enable location button
                $locationButton.removeAttribute('disabled');

                console.log('Location Shared!');
            });
    });
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error);
        //redirect to first page
        location.href = '/';
    }
});

//------------------------------------------COUNT APP ------------------------------------------------------

// socket.on('countUpdated', (count) => {
//     console.log('The count has been updated!', count);
// });

// document.querySelector('#increment').addEventListener('click', () => {
//     socket.emit('increment');
// })