const {DateTime} = require("luxon");

const setHeaders = (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        // Send response to OPTIONS requests
        res.set('Access-Control-Allow-Methods', 'GET');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.set('Access-Control-Max-Age', '3600');
        return res.status(204).send('');
    }
}

const getStreamLink = (streamId) => {
    return 'https://www.careerfairy.io/upcoming-livestream/' + streamId;
}

const formatHour = (LuxonTime) => {
    return LuxonTime.hour + ':' + (LuxonTime.minute < 10 ? ('0' + LuxonTime.minute) : LuxonTime.minute);
}

const getLivestreamTimeInterval = (livestreamStartDateTime) => {
    var startDateTime = DateTime.fromJSDate(livestreamStartDateTime.toDate(), {zone: 'Europe/Zurich'});
    return '(' + formatHour(startDateTime) + ')';
}


const generateEmailData = (livestreamId, livestream, startingNow) => {
    let recipientEmails = livestream.registeredUsers.join();
    var luxonStartDateTime = DateTime.fromJSDate(livestream.start.toDate(), {zone: 'Europe/Zurich'});
    const mailgunVariables = {
        "company": livestream.company,
        "startTime": formatHour(luxonStartDateTime),
        "streamLink": getStreamLink(livestreamId),
        "german": livestream.language === "DE" ? true : false
    };
    let recipientVariablesObj = {};
    livestream.registeredUsers.forEach(email => {
        recipientVariablesObj[email] = mailgunVariables;
    })
    if (startingNow) {
        return {
            from: "CareerFairy <noreply@careerfairy.io>",
            to: recipientEmails,
            subject: 'NOW: Live Stream with ' + livestream.company + ' ' + getLivestreamTimeInterval(livestream.start),
            template: 'registration-reminder',
            "recipient-variables": JSON.stringify(recipientVariablesObj)
        }
    } else {
        return {
            from: "CareerFairy <noreply@careerfairy.io>",
            to: recipientEmails,
            subject: 'Reminder: Live Stream with ' + livestream.company + ' ' + getLivestreamTimeInterval(livestream.start),
            template: 'registration-reminder',
            "recipient-variables": JSON.stringify(recipientVariablesObj),
            "o:deliverytime": luxonStartDateTime.minus({minutes: 45}).toRFC2822()
        }
    }
}
module.exports = {
    setHeaders,
    generateEmailData,
    formatHour,
    getLivestreamTimeInterval,
    getStreamLink
}