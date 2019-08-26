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


module.exports = {
    pickVolunteer
};