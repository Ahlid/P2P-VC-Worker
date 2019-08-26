const amqp = require('amqplib');
const io = require('socket.io-client');
const socket = io('http://localhost:8081');

const request = require('request');

const Volunteer = require('./volunteer');


let volunteers = {};

socket.on('connect', function () {
    console.log("connected")
});

socket.on('event', function (data) {
    console.log(data)
});


socket.on('update-volunteers', (data) => {
    console.log(data);
    volunteers = data;
});


socket.on('disconnect', function () {
    console.log("disconnected")
});


async function init() {


    const connection = await amqp.connect('amqp://localhost');

    const queue = 'jobs';

    const channel = await connection.createChannel();

    await channel.assertQueue(queue, {
        durable: false
    });

    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
    channel.consume(queue, function (msg) {
        console.log(" [x] Received %s", msg.content.toString());
        let possibleVolunteers = Volunteer.pickVolunteer(JSON.parse(msg.content), Object.values(volunteers));
        console.log(possibleVolunteers);
    }, {
        noAck: false
    });

}

init();

/*
setInterval(function () {
    for (let key in volunteers) {
        let volunteer = volunteers[key];
        request('http://' + volunteer.ip + ':' + volunteer.port + '/healthz', function (error, response, body) {
            console.error('error:', error); // Print the error if one occurred
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            console.log('body:', body); // Print the HTML for the Google homepage.
        });
    }

}, 5000);
*/
