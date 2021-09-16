const functions = require("firebase-functions");
const { generateEmailData, setHeaders } = require("./util");

const { mailgun } = require("./api/mailgun");
const { client } = require("./api/postmark");
const { admin } = require("./api/firestoreAdmin");

exports.sendReminderEmailToUserFromUniversity = functions.https.onRequest(
   async (req, res) => {
      console.log("running");

      setHeaders(req, res);

      let counter = 0;

      let groupId = req.body.groupId;
      let categoryId = req.body.categoryId;
      let categoryValueId = req.body.categoryValueId;

      let collectionRef = admin
         .firestore()
         .collection("userData")
         .where("groupIds", "array-contains", groupId);

      collectionRef
         .get()
         .then((querySnapshot) => {
            console.log("snapshotSize:" + querySnapshot.size);
            querySnapshot.forEach((doc) => {
               var id = doc.id;
               var userData = doc.data();
               let groupCategory = userData.registeredGroups.find(
                  (group) => group.groupId === groupId
               );
               if (groupCategory) {
                  let filteringCategory = groupCategory.categories.find(
                     (category) => category.id === categoryId
                  );
                  if (
                     filteringCategory &&
                     filteringCategory.selectedValueId === categoryValueId
                  ) {
                     console.log(userData.userEmail);
                     counter++;
                     const email = {
                        TemplateId: req.body.templateId,
                        From: "CareerFairy <noreply@careerfairy.io>",
                        To: userData.userEmail,
                        TemplateModel: {
                           userEmail: userData.userEmail,
                        },
                     };
                     client.sendEmailWithTemplate(email).then(
                        () => {
                           console.log("email sent to: " + userData.userEmail);
                        },
                        (error) => {
                           console.log("error:" + error);
                        }
                     );
                  }
               }
            });
         })
         .catch((error) => {
            console.log("error:" + error);
            return res.status(400).send();
         });
   }
);

exports.sendReminderEmailToRegistrants = functions.https.onRequest(
   async (req, res) => {
      setHeaders(req, res);

      let registeredUsers = [];
      admin
         .firestore()
         .collection("livestreams")
         .doc(req.body.livestreamId)
         .get()
         .then((doc) => {
            registeredUsers = doc.data().registeredUsers;
            let testEmails = ["maximilian@careerfairy.io"];
            let templates = [];
            registeredUsers.forEach((recipient) => {
               const email = {
                  TemplateId: req.body.templateId,
                  From: "CareerFairy <noreply@careerfairy.io>",
                  To: recipient,
                  TemplateModel: {},
               };
               templates.push(email);
            });
            let arraysOfTemplates = [];
            for (index = 0; index < templates.length; index += 500) {
               myChunk = templates.slice(index, index + 500);
               // Do something if you want with the group
               arraysOfTemplates.push(myChunk);
            }
            console.log(arraysOfTemplates.length);
            arraysOfTemplates.forEach((arrayOfTemplates) => {
               client.sendEmailBatchWithTemplates(arrayOfTemplates).then(
                  (response) => {
                     console.log(
                        `Successfully sent email to ${arrayOfTemplates.length}`
                     );
                  },
                  (error) => {
                     console.error(
                        `Error sending email to ${arrayOfTemplates.length}`,
                        error
                     );
                  }
               );
            });
         })
         .catch(() => {
            return res.status(400).send();
         });
   }
);

exports.scheduleReminderEmailSendTestOnRun = functions.pubsub
   .schedule("every 45 minutes")
   .timeZone("Europe/Zurich")
   .onRun(async (context) => {
      let messageSender = mailgun.messages();
      const dateStart = new Date(Date.now() + 1000 * 60 * 60);
      const dateEnd = new Date(Date.now() + 1000 * 60 * 60 * 1.75);
      await admin
         .firestore()
         .collection("livestreams")
         .where("start", ">=", dateStart)
         .where("start", "<", dateEnd)
         .get()
         .then((querySnapshot) => {
            console.log("querysnapshot size: " + querySnapshot.size);
            querySnapshot.forEach((doc) => {
               const livestream = doc.data();
               if (!livestream.isFaceToFace) {
                  livestream.id = doc.id;
                  functions.logger.log(
                     `Livestream with ${livestream.company}: prepare emails`
                  );

                  console.log(
                     "number of emails: " + livestream.registeredUsers.length
                  );
                  const data = generateEmailData(
                     livestream.id,
                     livestream,
                     false
                  );
                  messageSender.send(data, (error, body) => {
                     console.log("error:" + error);
                     console.log("body:" + JSON.stringify(body));
                  });
               } else {
                  functions.logger.log(
                     `Livestream with ${livestream.company} is F2F, no reminder email sent out`
                  );
               }
            });
         })
         .catch((error) => {
            console.log("error: " + error);
         });
      return null;
   });

exports.sendReminderEmailsWhenLivestreamStarts = functions.firestore
   .document("livestreams/{livestreamId}")
   .onUpdate((change, context) => {
      console.log("onUpdate");
      let mailgunSender = mailgun.messages();
      const previousValue = change.before.data();
      const newValue = change.after.data();
      if (newValue.test === false) {
         if (
            !previousValue.hasStarted &&
            !previousValue.hasSentEmails &&
            newValue.hasStarted === true
         ) {
            console.log("sendEmail");
            admin
               .firestore()
               .collection("livestreams")
               .doc(context.params.livestreamId)
               .update({ hasSentEmails: true })
               .then(() => {
                  const data = generateEmailData(
                     context.params.livestreamId,
                     newValue,
                     true
                  );
                  console.log(data);
                  mailgunSender.send(data, (error, body) => {
                     console.log("error:" + error);
                     console.log("body:" + JSON.stringify(body));
                  });
               });
         }
      }
   });
