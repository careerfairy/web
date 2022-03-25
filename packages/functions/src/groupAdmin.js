const functions = require("firebase-functions")
const {
   setHeaders,
   getArrayDifference,
   makeRequestingGroupIdFirst,
   convertPollOptionsObjectToArray,
   studentBelongsToGroup,
   getRegisteredStudentsStats,
   getRatingsAverage,
   getDateString,
   markStudentStatsInUse,
} = require("./util")
const { client } = require("./api/postmark")
const { admin } = require("./api/firestoreAdmin")
const { marketingTeamEmails } = require("./misc/marketingTeamEmails")

exports.sendDraftApprovalRequestEmail = functions.https.onCall(async (data) => {
   try {
      const {
         adminsInfo,
         senderName,
         livestream,
         submitTime,
         // TODO Update the cloud function to send the sender an email of the draft they submitted
         // senderEmail,
      } = data

      functions.logger.log("admins Info in approval request", adminsInfo)

      const emails = adminsInfo.map(({ email, eventDashboardLink }) => ({
         TemplateId: 22299429,
         From: "CareerFairy <noreply@careerfairy.io>",
         To: email,
         TemplateModel: {
            sender_name: senderName,
            livestream_title: livestream.title,
            livestream_company_name: livestream.company,
            draft_stream_link: eventDashboardLink,
            submit_time: submitTime,
         },
      }))

      client.sendEmailBatchWithTemplates(emails).then(
         (responses) => {
            responses.forEach((response) =>
               functions.logger.log(
                  "sent batch DraftApprovalRequestEmail email with response:",
                  response
               )
            )
         },
         (error) => {
            functions.logger.error("error:" + error)
         }
      )
   } catch (e) {
      functions.logger.error("e:" + e)
      throw new functions.https.HttpsError("unknown", e)
   }
})

exports.sendNewlyPublishedEventEmail = functions.https.onCall(async (data) => {
   try {
      const { adminsInfo, senderName, stream, submitTime } = data
      functions.logger.log("admins Info in newly published event", adminsInfo)
      const adminLinks = {
         eventDashboardLink:
            adminsInfo[0] && adminsInfo[0].eventDashboardLink
               ? adminsInfo[0].eventDashboardLink
               : "",
         nextLivestreamsLink:
            adminsInfo[0] && adminsInfo[0].nextLivestreamsLink
               ? adminsInfo[0].nextLivestreamsLink
               : "",
      }

      const marketingTeamInfo = marketingTeamEmails.map((email) => ({
         email,
         eventDashboardLink: adminLinks.eventDashboardLink,
         nextLivestreamsLink: adminLinks.nextLivestreamsLink,
      }))

      const emails = [...adminsInfo, ...marketingTeamInfo].map(
         ({ email, eventDashboardLink, nextLivestreamsLink }) => ({
            TemplateId: 25484780,
            From: "CareerFairy <noreply@careerfairy.io>",
            To: email,
            TemplateModel: {
               sender_name: senderName,
               dashboard_link: eventDashboardLink,
               next_livestreams_link: nextLivestreamsLink,
               livestream_title: stream.title,
               livestream_company_name: stream.company,
               submit_time: submitTime,
            },
         })
      )

      client.sendEmailBatchWithTemplates(emails).then(
         (responses) => {
            responses.forEach((response) =>
               functions.logger.log(
                  "sent batch newlyPublishedEventEmail email with response:",
                  response
               )
            )
         },
         (error) => {
            functions.logger.error("sendEmailBatchWithTemplates error:" + error)
            throw new functions.https.HttpsError("unknown", error)
         }
      )
   } catch (e) {
      functions.logger.error("e:" + e)
      throw new functions.https.HttpsError("unknown", e)
   }
})

exports.getLivestreamReportData = functions.https.onCall(
   async (data, context) => {
      const { targetStreamId, targetGroupId, userEmail } = data
      const universityReports = []
      let companyReport = null

      const authEmail = context.auth.token.email || null

      if (!targetStreamId || !targetGroupId || !userEmail) {
         throw new functions.https.HttpsError(
            "invalid-argument",
            "You must provide the following arguments: targetStreamId, targetGroupId, userEmail"
         )
      }

      if (!authEmail || authEmail !== userEmail) {
         throw new functions.https.HttpsError(
            "permission-denied",
            "You do not have permission to access this data"
         )
      }

      const getUsersByEmail = async (
         arrayOfEmails = [],
         options = { withEmpty: false }
      ) => {
         let totalUsers = []
         let i,
            j,
            tempArray,
            chunk = 800
         for (i = 0, j = arrayOfEmails.length; i < j; i += chunk) {
            tempArray = arrayOfEmails.slice(i, i + chunk)
            const userSnaps = await Promise.all(
               tempArray
                  .filter((email) => email)
                  .map((email) =>
                     admin.firestore().collection("userData").doc(email).get()
                  )
            )
            let newUsers
            if (options.withEmpty) {
               newUsers = userSnaps.map((doc) => ({
                  id: doc.id,
                  ...doc.data(),
               }))
            } else {
               newUsers = userSnaps
                  .filter((doc) => doc.exists)
                  .map((doc) => ({ id: doc.id, ...doc.data() }))
            }
            totalUsers = [...totalUsers, ...newUsers]
         }
         return totalUsers
      }

      const groupSnap = await admin
         .firestore()
         .collection("careerCenterData")
         .doc(targetGroupId)
         .get()

      const streamSnap = await admin
         .firestore()
         .collection("livestreams")
         .doc(targetStreamId)
         .get()

      const userSnap = await admin
         .firestore()
         .collection("userData")
         .doc(userEmail)
         .get()

      if (!groupSnap.exists || !streamSnap.exists || !userSnap.exists) {
         const missingDataType = !groupSnap.exists
            ? "targetGroupId"
            : !streamSnap.exists
            ? "targetStreamId"
            : "userEmail"

         throw new functions.https.HttpsError(
            "not-found",
            `The ${missingDataType} provided does not exist`
         )
      }

      try {
         const livestreamData = {
            ...streamSnap.data(),
            id: streamSnap.id,
            startDateString: getDateString(streamSnap.data()),
         }
         const requestingGroupData = { id: groupSnap.id, ...groupSnap.data() }
         const livestreamGroupIds = makeRequestingGroupIdFirst(
            livestreamData.groupIds,
            requestingGroupData.id
         )

         // Declaration of Snaps promises, todo turn into Promise.all()
         const talentPoolSnap = await admin
            .firestore()
            .collection("userData")
            .where("talentPools", "array-contains", livestreamData.companyId)
            .get()
         const pollsSnap = await streamSnap.ref
            .collection("polls")
            .orderBy("timestamp", "asc")
            .get()

         const iconsSnap = await streamSnap.ref
            .collection("icons")
            .orderBy("timestamp", "desc")
            .get()
         const questionsSnap = await streamSnap.ref
            .collection("questions")
            .orderBy("votes", "desc")
            .get()

         const ratingsSnap = await streamSnap.ref.collection("rating").get()

         let ratings = ratingsSnap.docs
            .filter((doc) => !doc.data().noStars)
            .map((doc) => ({
               id: doc.id,
               question: doc.data().question,
            }))

         ratings.forEach(async (rating) => {
            const individualRatingSnap = await streamSnap.ref
               .collection("rating")
               .doc(rating.id)
               .collection("voters")
               .get()

            rating.ratings = individualRatingSnap.docs.map((doc) => ({
               id: doc.id,
               ...doc.data(),
            }))

            rating.overallRating =
               rating.ratings.length > 0
                  ? getRatingsAverage(rating.ratings).toFixed(2)
                  : "N.A."
         })

         // Extraction of snap Data

         // Its let since this array will be modified
         let participatingStudents = await getUsersByEmail(
            livestreamData.participatingStudents || []
         )

         const talentPoolForReport = talentPoolSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
         }))

         const speakers = livestreamData.speakers || []

         const questions = questionsSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
         }))

         const polls = pollsSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            options: convertPollOptionsObjectToArray(doc.data().options),
         }))

         const icons = iconsSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            options: convertPollOptionsObjectToArray(doc.data().options || {}),
         }))

         let totalSumOfParticipatingStudentsWithStats = 0
         let totalSumOfUniversityStudents = 0
         let numberOfStudentsFollowingCompany = 0
         for (const groupId of livestreamGroupIds) {
            let groupData
            if (groupId === requestingGroupData.id) {
               groupData = requestingGroupData
            } else {
               const otherGroupSnap = await admin
                  .firestore()
                  .collection("careerCenterData")
                  .doc(groupId)
                  .get()
               if (!otherGroupSnap.exists) continue
               groupData = { id: otherGroupSnap.id, ...otherGroupSnap.data() }
            }
            if (groupData.universityCode) {
               // Generate university Report Data
               const studentsFromUniversity = participatingStudents.filter(
                  (student) =>
                     student.university &&
                     student.university.code === groupData.universityCode
               )
               const numberOfStudentsFromUniversity =
                  studentsFromUniversity.length
               const universityStudentsThatFollowingUniversity =
                  studentsFromUniversity.filter((student) =>
                     studentBelongsToGroup(student, groupData)
                  )

               participatingStudents = markStudentStatsInUse(
                  participatingStudents,
                  groupData
               )
               const studentStats = getRegisteredStudentsStats(
                  universityStudentsThatFollowingUniversity,
                  groupData
               )

               const universityReport = {
                  numberOfStudentsFromUniversity,
                  studentStats,
                  numberOfUniversityStudentsWithNoStats:
                     numberOfStudentsFromUniversity -
                     universityStudentsThatFollowingUniversity.length,
                  numberOfUniversityStudentsThatFollowingUniversity:
                     universityStudentsThatFollowingUniversity.length,
                  group: groupData,
                  groupName: groupData.universityName,
                  groupId: groupData.id,
                  isUniversity: Boolean(groupData.universityCode),
               }

               totalSumOfUniversityStudents += numberOfStudentsFromUniversity
               universityReports.push(universityReport)
            } else if (groupData.id === requestingGroupData.id) {
               // Generate company Data
               const studentsThatFollowCompany = participatingStudents.filter(
                  (student) => studentBelongsToGroup(student, groupData)
               )
               participatingStudents = markStudentStatsInUse(
                  participatingStudents,
                  groupData
               )

               numberOfStudentsFollowingCompany =
                  studentsThatFollowCompany.length

               const studentStats = getRegisteredStudentsStats(
                  studentsThatFollowCompany,
                  groupData
               )
               companyReport = {
                  numberOfStudentsFollowingCompany,
                  studentStats,
                  group: groupData,
                  groupName: groupData.universityName,
                  groupId: groupData.id,
                  isUniversity: Boolean(groupData.universityCode),
               }
            }
         }

         return {
            universityReports,
            companyReport,
            summary: {
               totalParticipating: participatingStudents.length,
               totalSumOfParticipatingStudentsWithStats,
               requestingGroupId: targetGroupId,
               requestingGroup: requestingGroupData,
               speakers,
               totalStudentsInTalentPool: talentPoolForReport.length,
               ratings: ratings,
               livestream: livestreamData,
               questions,
               polls,
               numberOfIcons: icons.length,
               totalSumOfUniversityStudents,
               numberOfStudentsThatDontFollowCompanyOrIsNotAUniStudent:
                  participatingStudents.length -
                  (totalSumOfUniversityStudents +
                     numberOfStudentsFollowingCompany),
            },
         }
      } catch (e) {
         functions.logger.error(e)
         throw new functions.https.HttpsError(
            "unknown",
            `Unhandled error: ${e.message}`
         )
      }
      // fetch all cc docs in the groupIds of the streamDoc
      // If use users stats only once per report data, once a users stats are used, flag them as already used
   }
)

exports.getLivestreamReportData_TEMP_NAME = functions.https.onCall(
   async (data, context) => {
      const { targetStreamId, targetGroupId, userEmail } = data
      const universityReports = []
      let companyReport = null

      const authEmail = context.auth.token.email || null

      if (!targetStreamId || !targetGroupId || !userEmail) {
         throw new functions.https.HttpsError(
            "invalid-argument",
            "You must provide the following arguments: targetStreamId, targetGroupId, userEmail"
         )
      }

      if (!authEmail || authEmail !== userEmail) {
         throw new functions.https.HttpsError(
            "permission-denied",
            "You do not have permission to access this data"
         )
      }

      const getUsersByEmail = async (
         arrayOfEmails = [],
         options = { withEmpty: false }
      ) => {
         let totalUsers = []
         let i,
            j,
            tempArray,
            chunk = 800
         for (i = 0, j = arrayOfEmails.length; i < j; i += chunk) {
            tempArray = arrayOfEmails.slice(i, i + chunk)
            const userSnaps = await Promise.all(
               tempArray
                  .filter((email) => email)
                  .map((email) =>
                     admin.firestore().collection("userData").doc(email).get()
                  )
            )
            let newUsers
            if (options.withEmpty) {
               newUsers = userSnaps.map((doc) => ({
                  id: doc.id,
                  ...doc.data(),
               }))
            } else {
               newUsers = userSnaps
                  .filter((doc) => doc.exists)
                  .map((doc) => ({ id: doc.id, ...doc.data() }))
            }
            totalUsers = [...totalUsers, ...newUsers]
         }
         return totalUsers
      }

      const groupSnap = await admin
         .firestore()
         .collection("careerCenterData")
         .doc(targetGroupId)
         .get()

      const streamSnap = await admin
         .firestore()
         .collection("livestreams")
         .doc(targetStreamId)
         .get()

      const userSnap = await admin
         .firestore()
         .collection("userData")
         .doc(userEmail)
         .get()

      if (!groupSnap.exists || !streamSnap.exists || !userSnap.exists) {
         const missingDataType = !groupSnap.exists
            ? "targetGroupId"
            : !streamSnap.exists
            ? "targetStreamId"
            : "userEmail"

         throw new functions.https.HttpsError(
            "not-found",
            `The ${missingDataType} provided does not exist`
         )
      }

      try {
         const livestreamData = {
            ...streamSnap.data(),
            id: streamSnap.id,
            startDateString: getDateString(streamSnap.data()),
         }
         const requestingGroupData = { id: groupSnap.id, ...groupSnap.data() }
         const livestreamGroupIds = makeRequestingGroupIdFirst(
            livestreamData.groupIds,
            requestingGroupData.id
         )

         // Declaration of Snaps promises, todo turn into Promise.all()
         const talentPoolSnap = await admin
            .firestore()
            .collection("userData")
            .where("talentPools", "array-contains", livestreamData.companyId)
            .get()
         const pollsSnap = await streamSnap.ref
            .collection("polls")
            .orderBy("timestamp", "asc")
            .get()

         const iconsSnap = await streamSnap.ref
            .collection("icons")
            .orderBy("timestamp", "desc")
            .get()
         const questionsSnap = await streamSnap.ref
            .collection("questions")
            .orderBy("votes", "desc")
            .get()

         const ratingsSnap = await streamSnap.ref.collection("rating").get()

         let ratings = []
         ratingsSnap.docs
            .filter((doc) => !doc.data().noStars)
            .map((doc) => {
               ratings = [
                  ...ratings,
                  {
                     id: doc.id,
                     question: doc.data().question,
                  },
               ]
            })

         ratings.forEach(async (rating) => {
            const individualRatingSnap = await streamSnap.ref
               .collection("rating")
               .doc(rating.id)
               .collection("voters")
               .get()

            rating.ratings = individualRatingSnap.docs.map((doc) => ({
               id: doc.id,
               ...doc.data(),
            }))

            rating.overallRating =
               rating.ratings.length > 0
                  ? getRatingsAverage(rating.ratings).toFixed(2)
                  : "N.A."
         })

         // Extraction of snap Data

         // Its let since this array will be modified
         let participatingStudents = await getUsersByEmail(
            livestreamData.participatingStudents || []
         )

         const talentPoolForReport = talentPoolSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
         }))

         const speakers = livestreamData.speakers || []

         const questions = questionsSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
         }))

         const polls = pollsSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            options: convertPollOptionsObjectToArray(doc.data().options),
         }))

         const icons = iconsSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            options: convertPollOptionsObjectToArray(doc.data().options || {}),
         }))

         let totalSumOfParticipatingStudentsWithStats = 0
         let totalSumOfUniversityStudents = 0
         let numberOfStudentsFollowingCompany = 0
         for (const groupId of livestreamGroupIds) {
            let groupData
            if (groupId === requestingGroupData.id) {
               groupData = requestingGroupData
            } else {
               const otherGroupSnap = await admin
                  .firestore()
                  .collection("careerCenterData")
                  .doc(groupId)
                  .get()
               if (!otherGroupSnap.exists) continue
               groupData = { id: otherGroupSnap.id, ...otherGroupSnap.data() }
            }
            if (groupData.universityCode) {
               // Generate university Report Data
               const studentsFromUniversity = participatingStudents.filter(
                  (student) =>
                     student.university &&
                     student.university.code === groupData.universityCode
               )
               const numberOfStudentsFromUniversity =
                  studentsFromUniversity.length
               const universityStudentsThatFollowingUniversity =
                  studentsFromUniversity.filter((student) =>
                     studentBelongsToGroup(student, groupData)
                  )

               participatingStudents = markStudentStatsInUse(
                  participatingStudents,
                  groupData
               )
               const studentStats = getRegisteredStudentsStats(
                  universityStudentsThatFollowingUniversity,
                  groupData
               )

               const universityReport = {
                  numberOfStudentsFromUniversity,
                  studentStats,
                  numberOfUniversityStudentsWithNoStats:
                     numberOfStudentsFromUniversity -
                     universityStudentsThatFollowingUniversity.length,
                  numberOfUniversityStudentsThatFollowingUniversity:
                     universityStudentsThatFollowingUniversity.length,
                  group: groupData,
                  groupName: groupData.universityName,
                  groupId: groupData.id,
                  isUniversity: Boolean(groupData.universityCode),
               }

               totalSumOfUniversityStudents += numberOfStudentsFromUniversity
               universityReports.push(universityReport)
            } else if (groupData.id === requestingGroupData.id) {
               // Generate company Data
               const studentsThatFollowCompany = participatingStudents.filter(
                  (student) => studentBelongsToGroup(student, groupData)
               )
               participatingStudents = markStudentStatsInUse(
                  participatingStudents,
                  groupData
               )

               numberOfStudentsFollowingCompany =
                  studentsThatFollowCompany.length

               const studentStats = getRegisteredStudentsStats(
                  studentsThatFollowCompany,
                  groupData
               )
               companyReport = {
                  numberOfStudentsFollowingCompany,
                  studentStats,
                  group: groupData,
                  groupName: groupData.universityName,
                  groupId: groupData.id,
                  isUniversity: Boolean(groupData.universityCode),
               }
            }
         }

         return {
            universityReports,
            companyReport,
            summary: {
               totalParticipating: participatingStudents.length,
               totalSumOfParticipatingStudentsWithStats,
               requestingGroupId: targetGroupId,
               requestingGroup: requestingGroupData,
               speakers,
               totalStudentsInTalentPool: talentPoolForReport.length,
               ratings: ratings,
               livestream: livestreamData,
               questions,
               polls,
               numberOfIcons: icons.length,
               totalSumOfUniversityStudents,
               numberOfStudentsThatDontFollowCompanyOrIsNotAUniStudent:
                  participatingStudents.length -
                  (totalSumOfUniversityStudents +
                     numberOfStudentsFollowingCompany),
            },
         }
      } catch (e) {
         functions.logger.error(e)
         throw new functions.https.HttpsError(
            "unknown",
            `Unhandled error: ${e.message}`
         )
      }
      // fetch all cc docs in the groupIds of the streamDoc
      // If use users stats only once per report data, once a users stats are used, flag them as already used
   }
)

exports.sendDashboardInviteEmail = functions.https.onRequest(
   async (req, res) => {
      setHeaders(req, res)

      const email = {
         TemplateId: 22272783,
         From: "CareerFairy <noreply@careerfairy.io>",
         To: req.body.recipientEmail,
         TemplateModel: {
            sender_first_name: req.body.sender_first_name,
            group_name: req.body.group_name,
            invite_link: req.body.invite_link,
         },
      }

      client.sendEmailWithTemplate(email).then(
         (response) => {
            return res.send(200)
         },
         (error) => {
            functions.logger.error(error)
            return res.status(400).send(error)
         }
      )
   }
)

exports.updateUserDocAdminStatus = functions.firestore
   .document("careerCenterData/{careerCenter}")
   .onUpdate(async (change) => {
      try {
         const careerCenterAfter = change.after.data()
         const careerCenterBefore = change.before.data()
         const newAdmins = getArrayDifference(
            careerCenterBefore.adminEmails,
            careerCenterAfter.adminEmails
         )
         const oldAdmins = getArrayDifference(
            careerCenterAfter.adminEmails,
            careerCenterBefore.adminEmails
         )

         if (newAdmins.length === 0 && oldAdmins.length === 0) {
            functions.logger.info(`No new admin has been added or removed`)
            return
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
               })
            functions.logger.info(
               `New group ${careerCenterAfter.groupId} has been added to user admin ${adminEmail}`
            )
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
               })
            functions.logger.info(
               `New group ${careerCenterAfter.groupId} has been removed from user admin ${adminEmail}`
            )
         }
      } catch (error) {
         functions.logger.error("failed to update admin email doc:", error)
      }
   })

exports.joinGroupDashboard = functions.https.onCall(async (data, context) => {
   let authEmail = context.auth.token.email || null

   if (!authEmail || authEmail !== data.userEmail) {
      throw new functions.https.HttpsError("permission-denied")
   }

   let groupRef = admin
      .firestore()
      .collection("careerCenterData")
      .doc(data.groupId)

   let userRef = admin.firestore().collection("userData").doc(data.userEmail)

   let notificationRef = admin
      .firestore()
      .collection("notifications")
      .doc(data.invitationId)

   let notificationDoc = await notificationRef.get()
   let notification = notificationDoc.data()

   if (
      notification.details.requester !== data.groupId ||
      notification.details.receiver !== data.userEmail
   ) {
      functions.logger.error(
         `User ${data.userEmail} trying to connect to group ${data.groupId} did not pass the notification check ${notification.details}`
      )
      throw new functions.https.HttpsError("permission-denied")
   }

   await admin.firestore().runTransaction((transaction) => {
      return transaction.get(userRef).then((userDoc) => {
         transaction.update(groupRef, {
            adminEmails: admin.firestore.FieldValue.arrayUnion(data.userEmail),
         })
         transaction.update(userRef, {
            adminIds: admin.firestore.FieldValue.arrayUnion(data.groupId),
         })
         let groupAdminRef = admin
            .firestore()
            .collection("careerCenterData")
            .doc(data.groupId)
            .collection("admins")
            .doc(data.userEmail)
         transaction.set(groupAdminRef, {
            role: "subAdmin",
         })

         transaction.delete(notificationRef)
      })
   })
})
