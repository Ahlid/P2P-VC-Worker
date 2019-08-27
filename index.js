const amqp = require('amqplib');
const io = require('socket.io-client');
const socket = io('http://localhost:8081');

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
    channel.consume(queue, async function (msg) {
        console.log(" [x] Received %s", msg.content.toString());
        let possibleVolunteers = Volunteer.pickVolunteer(JSON.parse(msg.content), Object.values(volunteers));
        console.log(possibleVolunteers);
        //todo: no volunteers
        if (possibleVolunteers.length > 0) {
            while (possibleVolunteers.length > 0) {
                let vol = possibleVolunteers.pop();
                if (await Volunteer.checkVolunteerAck(vol.ip, vol.port)) {
                    await Volunteer.sendJob();
                    break;
                }
            }
        }
        //todo: ack queue
        //todo: failure handle
    }, {
        noAck: false
    });

}

init();

