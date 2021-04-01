const functions = require('firebase-functions');

const {admin} = require('./api/firestoreAdmin')
const {client} = require('./api/postmark')

const {setHeaders} = require("./util");


exports.sendEmailToStudentOfUniversityAndField = functions.https.onRequest(async (req, res) => {
    setHeaders(req, res)

    const recipientsGroupsAndCategories = req.body.recipientsGroupsAndCategories;
    console.log(req.body);
    const groups = Object.keys(recipientsGroupsAndCategories);

    console.log(groups)
    let recipients = new Set();

    const emailsToRemove = ["christine.kaiser@hr.ethz.ch", "ekappel@gmx.ch,", "franziska.liese@hr.ethz.ch", "anja.pauling@hr.ethz.ch", "lorena.coletti@hr.ethz.ch",
        "john.imonopi@lernende.ethz.ch", "michael.grunder@hr.ethz.ch", "daniela.gunz@uzh.ch", "roger.gfroerer@careerservices.uzh.ch"]

    let snapshot = await admin.firestore().collection("userData").where("groupIds", "array-contains-any", groups).get();
    console.log(snapshot.size)
    snapshot.forEach(doc => {
        let student = doc.data()
        groups.forEach(group => {
            let registeredGroup = student.registeredGroups.find(registeredGroup => registeredGroup.groupId === group)
            if (registeredGroup) {
                let categoryId = recipientsGroupsAndCategories[group].categoryId;
                let selectedOptions = recipientsGroupsAndCategories[group].selectedOptions;
                let registeredCategory = registeredGroup.categories.find(category => category.id === categoryId);
                if (selectedOptions.includes(registeredCategory.selectedValueId) && !emailsToRemove.includes(student.userEmail) && !student.unsubscribed) {
                    recipients.add(student.userEmail);
                }
            }
        })
    })
    console.log(recipients.size)
    let testEmails = ["maximilian@careerfairy.io"]
    recipients.forEach(recipient => {
        const email = {
            "TemplateId": 22068118,
            "From": 'CareerFairy <noreply@careerfairy.io>',
            "To": recipient,
            "TemplateModel": {
                userEmail: recipient
            }
        };
        client.sendEmailWithTemplate(email).then(response => {
            console.log(`Successfully sent email to ${recipient}`);
        }, error => {
            console.error(`Error sending email to ${recipient}`, error);
        });
    })
});

