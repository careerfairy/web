const functions = require("firebase-functions");
const {
   setHeaders,
   getArrayDifference,
   makeRequestingGroupIdFirst,
   convertPollOptionsObjectToArray,
   studentBelongsToGroup,
   getStudentInGroupDataObject,
   getRegisteredStudentsStats,
   getRatingsAverage,
} = require("./util");
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

exports.getLivestreamReportData = functions.https.onCall(
   async (data, context) => {
      const { targetStreamId, targetGroupId, userEmail } = data;
      const reportData = [];

      const authEmail = context.auth.token.email || null;

      if (!targetStreamId || !targetGroupId || !userEmail) {
         throw new functions.https.HttpsError(
            "invalid-argument",
            "You must provide the following arguments: targetStreamId, targetGroupId, userEmail"
         );
      }

      if (!authEmail || authEmail !== userEmail) {
         throw new functions.https.HttpsError(
            "permission-denied",
            "You do not have permission to access this data"
         );
      }
      const groupSnap = await admin
         .firestore()
         .collection("careerCenterData")
         .doc(targetGroupId)
         .get();

      const streamSnap = await admin
         .firestore()
         .collection("livestreams")
         .doc(targetStreamId)
         .get();

      const userSnap = await admin
         .firestore()
         .collection("userData")
         .doc(userEmail)
         .get();

      if (!groupSnap.exists || !streamSnap.exists || !userSnap.exists) {
         const missingDataType = !groupSnap.exists
            ? "targetGroupId"
            : !streamSnap.exists
            ? "targetStreamId"
            : "userEmail";

         throw new functions.https.HttpsError(
            "not-found",
            `The ${missingDataType} provided does not exist`
         );
      }

      try {
         const livestreamData = { id: streamSnap.id, ...streamSnap.data() };
         const requestingGroupData = { id: groupSnap.id, ...groupSnap.data() };
         const livestreamGroupIds = makeRequestingGroupIdFirst(
            livestreamData.groupIds,
            requestingGroupData.id
         );
         console.log("-> livestreamGroupIds IN FUNC", livestreamGroupIds);

         // Declaration of Snaps promises, todo turn into Promise.all()
         const participatingUsersSnap = await streamSnap.ref
            .collection("participatingStudents")
            .get();
         const talentPoolSnap = await admin
            .firestore()
            .collection("userData")
            .where("talentPools", "array-contains", livestreamData.companyId)
            .get();
         const speakersSnap = await streamSnap.ref.collection("speakers").get();
         const pollsSnap = await streamSnap.ref
            .collection("polls")
            .orderBy("timestamp", "asc")
            .get();

         const iconsSnap = await streamSnap.ref
            .collection("icons")
            .orderBy("timestamp", "desc")
            .get();
         const questionsSnap = await streamSnap.ref
            .collection("questions")
            .orderBy("votes", "desc")
            .get();

         const contentRatingsSnap = await streamSnap.ref
            .collection("rating")
            .doc("company")
            .collection("voters")
            .get();

         const overallRatingsSnap = await streamSnap.ref
            .collection("rating")
            .doc("overall")
            .collection("voters")
            .get();

         // Extraction of snap Data

         // Its let since this array will be modified
         let participatingStudents = participatingUsersSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
         }));

         const talentPoolForReport = talentPoolSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
         }));

         const speakers = speakersSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
         }));

         const questions = questionsSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
         }));

         const polls = pollsSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            options: convertPollOptionsObjectToArray(doc.data().options),
         }));

         const icons = iconsSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            options: convertPollOptionsObjectToArray(doc.data().options || {}),
         }));

         const contentRatings = contentRatingsSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
         }));
         const overallRatings = overallRatingsSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
         }));

         const overallRatingValue =
            overallRatings.length > 0
               ? getRatingsAverage(overallRatings).toFixed(2)
               : "N.A.";

         const contentRatingValue =
            contentRatings.length > 0
               ? getRatingsAverage(contentRatings).toFixed(2)
               : "N.A.";

         for (const groupId of livestreamGroupIds) {
            let groupData;
            if (groupId === requestingGroupData.id) {
               groupData = requestingGroupData;
            } else {
               const otherGroupSnap = await admin
                  .firestore()
                  .collection("careerCenterData")
                  .doc(groupId)
                  .get();
               if (!otherGroupSnap.exists) continue;
               groupData = { id: otherGroupSnap.id, ...otherGroupSnap.data() };
            }
            const participatingStudentsFromGroup = [];
            const listOfStudentsForStats = [];
            participatingStudents = participatingStudents.map((student) => {
               if (studentBelongsToGroup(student, groupData)) {
                  const publishedStudent = getStudentInGroupDataObject(
                     student,
                     groupData
                  );
                  participatingStudentsFromGroup.push(publishedStudent);
                  if (!student.statsAlreadyInUse) {
                     listOfStudentsForStats.push({ ...student });
                     student.statsAlreadyInUse = true;
                  }
               }
               return { ...student };
            });
            const studentStats = getRegisteredStudentsStats(
               listOfStudentsForStats,
               groupData
            );

            reportData.push({
               group: groupData,
               groupName: groupData.universityName,
               groupId: groupData.id,
               livestream: livestreamData,
               studentStats,
               speakers,
               overallRating: overallRatingValue,
               contentRating: contentRatingValue,
               totalStudentsInTalentPool: talentPoolForReport.length,
               totalParticipating: participatingStudents.length,
               totalViewerFromOutsideGroup:
                  participatingStudents.length -
                  participatingStudentsFromGroup.length,
               totalViewerFromGroup: participatingStudentsFromGroup.length,
               questions,
               polls,
               numberOfIcons: icons.length,
               requestingGroupId: targetGroupId,
               participatingStudents,
               totalWithoutData: participatingStudents.filter(
                  (student) => !student.statsAlreadyInUse
               ).length,
            });
         }

         // console.log("-> reportData", reportData);
         // functions.logger.log("-> reportData", reportData);
      } catch (e) {
         console.error(e);
         throw new functions.https.HttpsError(
            "unknown",
            `Unhandled error: ${e.message}`
         );
      }
      return reportData;
      // fetch all cc docs in the groupIds of the streamDoc
      // If use users stats only once per report data, once a users stats are used, flag them as already used
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
