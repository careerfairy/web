const functions = require('firebase-functions');
const {setHeaders} = require("./util");
const {client} = require('./api/postmark')


exports.sendDraftApprovalRequestEmail = functions.https.onRequest(async (req, res) => {

    setHeaders(req, res)

    const adminsInfo = req.body.adminsInfo || []

    functions.logger.log("admins Info in approval request", adminsInfo)

    const emails = adminsInfo.map(({email, link}) => ({
        "TemplateId": 22299429,
        "From": 'CareerFairy <noreply@careerfairy.io>',
        "To": email,
        "TemplateModel": {
            sender_name: req.body.sender_name,
            livestream_title: req.body.livestream_title,
            livestream_company_name: req.body.livestream_company_name,
            draft_stream_link: link,
            submit_time: req.body.submit_time,
        }
    }))

    client.sendEmailBatchWithTemplates(emails).then(responses => {
        responses.forEach(response => functions.logger.log('sent batch DraftApprovalRequestEmail email with response:', response))
        return res.send(200);
    }, error => {
        functions.logger.error('error:' + error)
        console.log('error:' + error);
        return res.status(400).send(error);
    });
});

exports.sendDashboardInviteEmail = functions.https.onRequest(async (req, res) => {

    setHeaders(req, res)

    const email = {
        "TemplateId": 22272783,
        "From": 'CareerFairy <noreply@careerfairy.io>',
        "To": req.body.recipientEmail,
        "TemplateModel": {
            sender_first_name: req.body.sender_first_name,
            group_name: req.body.group_name,
            invite_link: req.body.invite_link,
        }
    };

    client.sendEmailWithTemplate(email).then(response => {
        return res.send(200);
    }, error => {
        console.log('error:' + error);
        return res.status(400).send(error);
    });
});

