const functions = require('firebase-functions');
const {client} = require('./api/postmark')
const {admin} = require('./api/firestoreAdmin')

const {setHeaders} = require("./util");


const getRandomInt = (max) => {
    let variable = Math.floor(Math.random() * Math.floor(max));
    if (variable < 1000) {
        return variable + 1000;
    } else {
        return variable;
    }
}


exports.createNewUserAccount = functions.https.onCall( async (data, context) => {

    if (context.auth) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError('failed-precondition', 'The function must be called while logged out.');
    }

    const userData = data.userData;
    const recipient_email = data.userData.email;
    const pinCode = getRandomInt(9999);

    await admin.auth().createUser({ email: userData.email, password: userData.password })
        .then( async (user) => {
            await admin.firestore().collection("userData").doc(recipient_email).set(
                {
                    id: userData.email,
                    validationPin: pinCode,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    userEmail: userData.email,
                    university: userData.university,
                    universityCountryCode: userData.universityCountryCode,
                }).then( async () => {
                    const email = {
                        "TemplateId": 17669843,
                        "From": 'CareerFairy <noreply@careerfairy.io>',
                        "To": recipient_email,
                        "TemplateModel": { pinCode: pinCode }
                    };
                    try {
                        let response = await client.sendEmailWithTemplate(email)
                        return response;
                    } catch (error) {
                        console.error(`Error sending PIN email to ${recipient_email}`, error);
                        await admin.auth().deleteUser(user.uid)
                        await admin.firestore().collection("userData").doc(recipient_email).delete()
                        throw new functions.https.HttpsError('resource-exhausted', 'Error sending out PIN email');
                    }
            }).catch( async (error) => {
                if (error.code !== 'resource-exhausted') {
                    console.error(`Error creating user ${recipient_email} in firestore`, error);
                    await admin.auth().deleteUser(user.uid)
                }     
                throw new functions.https.HttpsError('internal', error);
            });
        }).catch( async (error) => {
            console.error(`Error creating user ${recipient_email} in firebase auth`, error);
            throw new functions.https.HttpsError('internal', error);
        });
})


exports.resendPostmarkEmailVerificationEmailWithPin = functions.https.onRequest(async (req, res) => {

    setHeaders(req, res)

    const recipient_email = req.body.recipientEmail;
    const pinCode = getRandomInt(9999);

    await admin.firestore().collection("userData").doc(recipient_email).update({validationPin: pinCode});

    const email = {
        "TemplateId": 17669843,
        "From": 'CareerFairy <noreply@careerfairy.io>',
        "To": recipient_email,
        "TemplateModel": {pinCode: pinCode}
    };

    return client.sendEmailWithTemplate(email).then(response => {
        res.sendStatus(200);
    }, error => {
        res.sendStatus(500);
    });
});

exports.verifyEmailWithPin = functions.https.onRequest(async (req, res) => {

    setHeaders(req, res)

    const recipient_email = req.body.recipientEmail;
    const pinCode = req.body.pinCode;

    admin.firestore().collection("userData").doc(recipient_email).get().then(querySnapshot => {
        if (!querySnapshot.isEmpty) {
            let user = querySnapshot.data();
            if (user.validationPin === pinCode) {
                admin.auth().getUserByEmail(recipient_email).then(userRecord => {
                    admin.auth().updateUser(userRecord.uid, {
                        emailVerified: true
                    }).then(userRecord => {
                        console.log(userRecord);
                        res.sendStatus(200);
                    })
                })
            } else {
                res.sendStatus(403);
            }
        }
    }).catch(error => {
        res.sendStatus(500);
    });
});


exports.sendPostmarkResetPasswordEmail = functions.https.onRequest(async (req, res) => {

    setHeaders(req, res)

    const recipient_email = req.body.recipientEmail;
    const redirect_link = req.body.redirect_link;

    const actionCodeSettings = {
        url: redirect_link
    };

    admin.auth().generatePasswordResetLink(recipient_email, actionCodeSettings)
        .then((link) => {
            const email = {
                "TemplateId": 16531013,
                "From": 'CareerFairy <noreply@careerfairy.io>',
                "To": recipient_email,
                "TemplateModel": {action_url: link}
            };
            return client.sendEmailWithTemplate(email).then(response => {
                res.send(200);
            }, error => {
                res.send('Error: ' + error);
            });
        })
        .catch((error) => {
            console.log(error);
        });
});

exports.sendPostmarkEmailUserDataAndUni = functions.https.onRequest(async (req, res) => {

    setHeaders(req, res)

    const recipient_email = req.body.recipientEmail;
    const recipient_first_name = req.body.firstName;
    const recipient_last_name = req.body.lastName;
    const recipient_university = req.body.universityCode;
    const recipient_university_country_code = req.body.universityCountryCode;
    const pinCode = getRandomInt(9999);

    admin.firestore().collection("userData").doc(recipient_email).set(
        {
            id: recipient_email,
            validationPin: pinCode,
            firstName: recipient_first_name,
            lastName: recipient_last_name,
            userEmail: recipient_email,
            universityCode: recipient_university,
            universityCountryCode: recipient_university_country_code,
        }).then(() => {
        const email = {
            "TemplateId": 17669843,
            "From": 'CareerFairy <noreply@careerfairy.io>',
            "To": recipient_email,
            "TemplateModel": {pinCode: pinCode}
        };

        return client.sendEmailWithTemplate(email).then(response => {
            console.log(`Successfully sent PIN email to ${recipient_email}`);
            res.sendStatus(200);
        }, error => {
            console.error(`Error sending PIN email to ${recipient_email}`, error);
            res.sendStatus(500);
        });
    }).catch((error) => {
        console.error(`Error creating user ${recipient_email}`, error);
        res.sendStatus(500);
    });
});

exports.sendPostmarkEmailUserDataAndUniWithName = functions.https.onRequest(async (req, res) => {

    setHeaders(req, res)

    const recipient_email = req.body.recipientEmail;
    const recipient_first_name = req.body.firstName;
    const recipient_last_name = req.body.lastName;
    const recipient_university = req.body.universityCode;
    const recipient_university_name = req.body.universityName;
    const recipient_university_country_code = req.body.universityCountryCode;
    const pinCode = getRandomInt(9999);

    admin.firestore().collection("userData").doc(recipient_email).set(
        {
            id: recipient_email,
            validationPin: pinCode,
            firstName: recipient_first_name,
            lastName: recipient_last_name,
            userEmail: recipient_email,
            universityCode: recipient_university,
            university: {
                name: recipient_university_name,
                code: recipient_university
            },
            universityName: recipient_university_name,
            universityCountryCode: recipient_university_country_code,
        }).then(() => {
        const email = {
            "TemplateId": 17669843,
            "From": 'CareerFairy <noreply@careerfairy.io>',
            "To": recipient_email,
            "TemplateModel": {pinCode: pinCode}
        };

        return client.sendEmailWithTemplate(email).then(response => {
            console.log(`Successfully sent PIN email to ${recipient_email}`);
            res.sendStatus(200);
        }, error => {
            console.error(`Error sending PIN email to ${recipient_email}`, error);
            res.sendStatus(500);
        });
    }).catch((error) => {
        console.error(`Error creating user ${recipient_email}`, error);
        res.sendStatus(500);
    });
});


exports.updateFakeUser = functions.https.onRequest(async (req, res) => {

    setHeaders(req, res)

    admin.auth().updateUser(req.body.uid, {
        emailVerified: true
    })
        .then(function (userRecord) {
            // See the UserRecord reference doc for the contents of userRecord.
            console.log('Successfully updated user', userRecord.toJSON());
        })
        .catch(function (error) {
            console.log('Error updating user:', error);
        });
});
