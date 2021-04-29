const functions = require('firebase-functions');

const {admin} = require('./api/firestoreAdmin')
const {client} = require('./api/postmark')

const {setHeaders} = require("./util");

exports.assertLivestreamRegistrationWasCompleted = functions.firestore
    .document('livestreams/{livestreamId}/registeredStudents/{studentId}')
    .onCreate((snapshot, context) => {
        console.log(`Documents created in registeredStudents in ${context.params.livestreamId}`);
        if (snapshot.exists) {
            admin.firestore().collection("livestreams").doc(context.params.livestreamId).update({
                registeredUsers: admin.firestore.FieldValue.arrayUnion(context.params.studentId)
            }).then(() => {
                console.log(`Successfully updated registeredUsers in ${context.params.livestreamId}`)
            })
        }
    });

exports.assertLivestreamDeregistrationWasCompleted = functions.firestore
    .document('livestreams/{livestreamId}/registeredStudents/{studentId}')
    .onDelete((snapshot, context) => {
        console.log(`Documents deleted in registeredStudents in ${context.params.livestreamId}`);
        admin.firestore().collection("livestreams").doc(context.params.livestreamId).update({
            registeredUsers: admin.firestore.FieldValue.arrayRemove(context.params.studentId)
        }).then(() => {
            console.log(`Successfully removed user from registeredUsers in ${context.params.livestreamId}`)
        })
    });

exports.scheduleTestLivestreamDeletion = functions.pubsub.schedule('every sunday 09:00').timeZone('Europe/Zurich').onRun((context) => {
    admin.firestore().collection("livestreams")
        .where("test", "==", true)
        .get().then((querySnapshot) => {
        console.log("querysnapshot size: " + querySnapshot.size);
        querySnapshot.forEach(doc => {
            admin.firestore().collection("livestreams").doc(doc.id).delete().catch((e) => {
                console.log(e)
            });
        })
    });
});


exports.sendLivestreamRegistrationConfirmationEmail = functions.https.onRequest(async (req, res) => {
    setHeaders(req, res)

    const email = {
        "TemplateId": 16533319,
        "From": 'CareerFairy <noreply@careerfairy.io>',
        "To": req.body.recipientEmail,
        "TemplateModel": {
            user_first_name: req.body.user_first_name,
            livestream_date: req.body.livestream_date,
            company_name: req.body.company_name,
            company_logo_url: req.body.company_logo_url,
            livestream_title: req.body.livestream_title,
            livestream_link: req.body.livestream_link
        }
    };

    client.sendEmailWithTemplate(email).then(response => {
        return res.send(200);
    }, error => {
        console.log('error:' + error);
        return res.status(400).send(error);
    });
});

exports.sendPhysicalEventRegistrationConfirmationEmail = functions.https.onRequest(async (req, res) => {
    setHeaders(req, res)

    const email = {
        "TemplateId": 20754935,
        "From": 'CareerFairy <noreply@careerfairy.io>',
        "To": req.body.recipientEmail,
        "TemplateModel": {
            user_first_name: req.body.user_first_name,
            event_date: req.body.event_date,
            company_name: req.body.company_name,
            company_logo_url: req.body.company_logo_url,
            event_title: req.body.event_title,
            event_address: req.body.event_address
        }
    };

    client.sendEmailWithTemplate(email).then(response => {
        return res.send(200);
    }, error => {
        console.log('error:' + error);
        return res.status(400).send(error);
    });
});

exports.setFirstCommentOfQuestionOnCreate = functions.firestore.document('livestreams/{livestream}/questions/{question}/comments')
    .onCreate(async (commentSnap, context) => {
        try {
            const commentData = commentSnap.data()
            const questionRef = commentSnap.ref.parent.parent
            const questionSnap = await questionRef.get()
            if (questionSnap.exists) {
                const questionData = questionSnap.data()
                let questionDataToUpdate = {
                    numberOfComments: admin.firestore.FieldValue.increment(1)
                }
                if (!questionData.firstComment) {
                    questionDataToUpdate.firstComment = commentData
                }
                const successMessage = questionData.firstComment ?
                    "Question already has first comment, only increment" :
                    `Updated question doc (${questionRef.path}) with new first comment`
                functions.logger.log(successMessage)
            }
            functions.logger.warn(`The question (${questionRef.path}) does not exist for comment ${commentSnap.ref.path}`)
        } catch (e) {
            functions.logger.error("error in setFirstCommentOfQuestionOnCreate", e)
        }
    })