const request = require('request-promise-native');

const basics = ['disc', 'RAM', 'CPU', 'credibility'];

function pickVolunteer(job, volunteers) {

    return volunteers.filter(volunteer => {

        if (volunteer.state !== 'FREE')
            return false;

        if (volunteer.price > job.price)
            return false;

        for (let i = 0; i < basics.length; i++) {
            let basic = basics[i];

            if (job[basic] && volunteer[basic] < job[basic]) {

                return false;
            }

        }

        //TODO: mean up time

        return true;

    })

}

async function checkVolunteerAck(ip, port, timeout = 5000) {
    try {
        let res = await request('http://' + ip + ':' + port + '/healthz', {timeout})
        return res.statusCode === 200;
    } catch (e) {
        return false;
    }
}

async function sendJob(volunteer, job) {
//todo: send job
}

module.exports = {
    pickVolunteer,
    checkVolunteerAck,
    sendJob
};