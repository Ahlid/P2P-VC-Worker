const amqp = require('amqplib');


async function init() {


    const connection = await amqp.connect('amqp://localhost');

    const queue = 'jobs';

    const channel = await connection.createChannel();

    await channel.assertQueue(queue, {
        durable: false
    });

    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
    channel.consume(queue, function(msg) {
        console.log(" [x] Received %s", msg.content.toString());
    }, {
        noAck: true
    });

}

init();