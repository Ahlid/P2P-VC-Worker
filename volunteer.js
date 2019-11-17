const request = require('request-promise-native');

const basics = ['disc', 'RAM', 'CPU', 'credibility'];

function Volunteer() {
    this.queue = [];
    this.volunteers = {};
}

Volunteer.prototype.addJob = function (job) {
    this.queue.push(job);
    this.doJobs(job);
};

Volunteer.prototype.setChannel = function (channel) {
    this.channel = channel;
};

Volunteer.prototype.setVolunteerList = function (volunteers) {
    this.volunteers = volunteers;
    this.doJobs();
};

Volunteer.prototype.doJobs = function () {

    if (this.queue.length > 0) {

        let job = this.queue.shift();

        this.startJob(job).then(() => {
            console.log("ACK JOB????????");
            this.channel.ack(job.msg);
        }).catch(e => {
            this.queue.push(job);
        });

        this.doJobs();
    }


};

Volunteer.prototype.startJob = async function (job) {

    const possibleVolunteers = this.pickVolunteer(job);
    //todo: no volunteers
    if (possibleVolunteers.length > 0) {
        while (possibleVolunteers.length > 0) {
            let vol = possibleVolunteers.pop();
            if (await this.checkVolunteerAck(vol.ip, vol.port)) {
                console.log("ok");
                await this.sendJob(vol, job);
                return;
            }

            console.log("volunteer off")
        }

        throw new Error('VOLUNTEERS_NOT_FOUND');

    } else {

        throw new Error('VOLUNTEERS_NOT_FOUND');
    }
    //todo: ack queue
    //todo: failure handle
};

Volunteer.prototype.pickVolunteer = function (job) {


    return Object.values(this.volunteers).filter(volunteer => {

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

};

Volunteer.prototype.checkVolunteerAck = async function (ip, port, timeout = 5000) {
    try {
        let res = await request('http://' + ip + ':' + port + '/healthz', {timeout})
        return true;
    } catch (e) {
        return false;
    }
}

Volunteer.prototype.sendJob = async function (volunteer, job) {
    try {
        await request('http://' + volunteer.ip + ':' + volunteer.port + '/data/upload/' + job.id, {method: 'POST'});
        await request('http://' + volunteer.ip + ':' + volunteer.port + '/code/upload/' + job.id, {method: 'POST'});
        await request('http://' + volunteer.ip + ':' + volunteer.port + '/run/' + job.id + '/' + job.exec_file,
            {
                method: 'POST',
                json: true,
                body: {partialResultsVars: job.partialResultsVars}
            });
        return true;
    } catch (e) {
        console.log(e);
        return false;
    }

}

module.exports = Volunteer;