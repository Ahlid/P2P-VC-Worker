const amqp = require('amqplib');
const io = require('socket.io-client');
const socket = io('http://localhost:8081');

const Volunteer = require('./volunteer');

const volunteerManager = new Volunteer();


socket.on('connect', function () {
    console.log("connected")
});

socket.on('event', function (data) {
    console.log(data)
});


socket.on('update-volunteers', (data) => {
    // console.log(data);
    volunteerManager.setVolunteerList(data);
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

    volunteerManager.setChannel(channel);

    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
    channel.consume(queue, async function (msg) {
        console.log(" [x] Received %s", msg.content.toString());

        const job = JSON.parse(msg.content);
        job.msg = msg;
        volunteerManager.addJob(job);

        //channel.ack(msg);

    }, {
        noAck: false
    });

}

init();

