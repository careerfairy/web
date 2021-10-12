const functions = require("firebase-functions");
const { setHeaders, getArrayDifference } = require("./util");
const { client } = require("./api/postmark");
const { admin } = require("./api/firestoreAdmin");

exports.sendDraftApprovalRequestEmail = functions.https.onRequest(
   async (req, res) => {
      setHeaders(req, res);

      const adminsInfo = req.body.adminsInfo || [];

      functions.logger.log("admins Info in approval request", adminsInfo);

      const emails = adminsInfo.map(({ email, draftStreamDashboardLink }) => ({
         TemplateId: 22299429,
         From: "CareerFairy <noreply@careerfairy.io>",
         To: email,
         TemplateModel: {
            sender_name: req.body.sender_name,
            livestream_title: req.body.livestream_title,
            livestream_company_name: req.body.livestream_company_name,
            draft_stream_link: draftStreamDashboardLink,
            submit_time: req.body.submit_time,
         },
      }));

      client.sendEmailBatchWithTemplates(emails).then(
         (responses) => {
            responses.forEach((response) =>
               functions.logger.log(
                  "sent batch DraftApprovalRequestEmail email with response:",
                  response
               )
            );
            return res.send(200);
         },
         (error) => {
            functions.logger.error("error:" + error);
            console.log("error:" + error);
            return res.status(400).send(error);
         }
      );
   }
);

exports.sendNewlyPublishedEventEmail = functions.https.onRequest(
   async (req, res) => {
      setHeaders(req, res);

      const adminsInfo = req.body.adminsInfo || [];

      functions.logger.log("admins Info in newly published event", adminsInfo);

      const emails = adminsInfo.map(
         ({ email, livestreamDashboardLink, nextLivestreamsLink }) => ({
            TemplateId: 25484780,
            From: "CareerFairy <noreply@careerfairy.io>",
            To: email,
            TemplateModel: {
               sender_name: req.body.sender_name,
               dashboard_link: nextLivestreamsLink,
               next_livestreams_link: livestreamDashboardLink,
               livestream_title: req.body.livestream_title,
               livestream_company_name: req.body.livestream_company_name,
               submit_time: req.body.submit_time,
            },
         })
      );

      client.sendEmailBatchWithTemplates(emails).then(
         (responses) => {
            responses.forEach((response) =>
               functions.logger.log(
                  "sent batch newlyPublishedEventEmail email with response:",
                  response
               )
            );
            return res.send(200);
         },
         (error) => {
            functions.logger.error("error:" + error);
            console.log("error:" + error);
            return res.status(400).send(error);
         }
      );
   }
);

exports.sendDashboardInviteEmail = functions.https.onRequest(
   async (req, res) => {
      setHeaders(req, res);

      const email = {
         TemplateId: 22272783,
         From: "CareerFairy <noreply@careerfairy.io>",
         To: req.body.recipientEmail,
         TemplateModel: {
            sender_first_name: req.body.sender_first_name,
            group_name: req.body.group_name,
            invite_link: req.body.invite_link,
         },
      };

      client.sendEmailWithTemplate(email).then(
         (response) => {
            return res.send(200);
         },
         (error) => {
            console.log("error:" + error);
            return res.status(400).send(error);
         }
      );
   }
);

exports.updateUserDocAdminStatus = functions.firestore
   .document("careerCenterData/{careerCenter}")
   .onUpdate(async (change) => {
      try {
         const careerCenterAfter = change.after.data();
         const careerCenterBefore = change.before.data();
         const newAdmins = getArrayDifference(
            careerCenterBefore.adminEmails,
            careerCenterAfter.adminEmails
         );
         const oldAdmins = getArrayDifference(
            careerCenterAfter.adminEmails,
            careerCenterBefore.adminEmails
         );

         if (newAdmins.length === 0 && oldAdmins.length === 0) {
            functions.logger.info(`No new admin has been added or removed`);
            return;
         }

         for (const adminEmail of newAdmins) {
            await admin
               .firestore()
               .collection("userData")
               .doc(adminEmail)
               .update({
                  adminIds: admin.firestore.FieldValue.arrayUnion(
                     careerCenterAfter.groupId
                  ),
               });
            functions.logger.info(
               `New group ${careerCenterAfter.groupId} has been added to user admin ${adminEmail}`
            );
         }

         for (const adminEmail of oldAdmins) {
            await admin
               .firestore()
               .collection("userData")
               .doc(adminEmail)
               .update({
                  adminIds: admin.firestore.FieldValue.arrayRemove(
                     careerCenterAfter.groupId
                  ),
               });
            functions.logger.info(
               `New group ${careerCenterAfter.groupId} has been removed from user admin ${adminEmail}`
            );
         }
      } catch (error) {
         functions.logger.error("failed to update admin email doc:", error);
      }
   });

exports.joinGroupDashboard = functions.https.onCall(async (data, context) => {
   let authEmail = context.auth.token.email || null;

   if (!authEmail || authEmail !== data.userEmail) {
      throw new functions.https.HttpsError("permission-denied");
   }

   let groupRef = admin
      .firestore()
      .collection("careerCenterData")
      .doc(data.groupId);

   let userRef = admin.firestore().collection("userData").doc(data.userEmail);

   let notificationRef = admin
      .firestore()
      .collection("notifications")
      .doc(data.invitationId);

   let notificationDoc = await notificationRef.get();
   let notification = notificationDoc.data();

   if (
      notification.details.requester !== data.groupId ||
      notification.details.receiver !== data.userEmail
   ) {
      functions.logger.error(
         `User ${data.userEmail} trying to connect to group ${data.groupId} did not pass the notification check ${notification.details}`
      );
      throw new functions.https.HttpsError("permission-denied");
   }

   await admin.firestore().runTransaction((transaction) => {
      return transaction.get(userRef).then((userDoc) => {
         transaction.update(groupRef, {
            adminEmails: admin.firestore.FieldValue.arrayUnion(data.userEmail),
         });
         transaction.update(userRef, {
            adminIds: admin.firestore.FieldValue.arrayUnion(data.groupId),
         });
         let groupAdminRef = admin
            .firestore()
            .collection("careerCenterData")
            .doc(data.groupId)
            .collection("admins")
            .doc(data.userEmail);
         transaction.set(groupAdminRef, {
            role: "subAdmin",
         });

         transaction.delete(notificationRef);
      });
   });
});
