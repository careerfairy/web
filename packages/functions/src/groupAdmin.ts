import { UserData } from "@careerfairy/shared-lib/dist/users"
import { Group } from "@careerfairy/shared-lib/dist/groups"
import {
   LivestreamEvent,
   LivestreamPoll,
   LivestreamQuestion,
} from "@careerfairy/shared-lib/dist/livestreams"
import { GroupPresenter } from "@careerfairy/shared-lib/dist/groups/GroupPresenter"
import { mapFirestoreDocuments } from "@careerfairy/shared-lib/dist/BaseFirebaseRepository"
import {
   getPdfCategoryChartData,
   PdfCategoryChartData,
   PdfReportData,
} from "@careerfairy/shared-lib/dist/groups/pdf-report"
import { fieldOfStudyRepo, groupRepo, livestreamRepo } from "./api/repositories"

const functions = require("firebase-functions")
const {
   setHeaders,
   getArrayDifference,
   makeRequestingGroupIdFirst,
   getRatingsAverage,
   getDateString,
   partition,
} = require("./util")
const { client } = require("./api/postmark")
const { admin } = require("./api/firestoreAdmin")
const { marketingTeamEmails } = require("./misc/marketingTeamEmails")

export const sendDraftApprovalRequestEmail = functions.https.onCall(
   async (data) => {
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
            TemplateId:
               process.env.POSTMARK_TEMPLATE_DRAFT_STREAM_APPROVAL_REQUEST,
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
   }
)

export const sendNewlyPublishedEventEmail = functions.https.onCall(
   async (data) => {
      try {
         const { adminsInfo, senderName, stream, submitTime } = data
         functions.logger.log(
            "admins Info in newly published event",
            adminsInfo
         )
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
               TemplateId: process.env.POSTMARK_TEMPLATE_NEWLY_PUBLISHED_EVENT,
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
               functions.logger.error(
                  "sendEmailBatchWithTemplates error:" + error
               )
               throw new functions.https.HttpsError("unknown", error)
            }
         )
      } catch (e) {
         functions.logger.error("e:" + e)
         throw new functions.https.HttpsError("unknown", e)
      }
   }
)

export const getLivestreamReportData_v4 = functions.https.onCall(
   async (data, context) => {
      const { targetStreamId, targetGroupId, userEmail } = data
      const hostsData: PdfReportData["hostsData"] = []
      let universityChartData: PdfCategoryChartData = null
      let nonUniversityChartData: PdfCategoryChartData = null

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
         } as LivestreamEvent

         const requestingGroupData = {
            id: groupSnap.id,
            ...groupSnap.data(),
         } as Group

         const livestreamGroupIds = makeRequestingGroupIdFirst(
            livestreamData.groupIds,
            requestingGroupData.id
         )
         const [talentPoolSnap, pollsSnap, iconsSnap, questionsSnap] =
            await Promise.all([
               admin
                  .firestore()
                  .collection("userData")
                  .where(
                     "talentPools",
                     "array-contains",
                     livestreamData.companyId
                  )
                  .get(),
               streamSnap.ref
                  .collection("polls")
                  .orderBy("timestamp", "asc")
                  .get(),
               streamSnap.ref
                  .collection("icons")
                  .orderBy("timestamp", "desc")
                  .get(),
               streamSnap.ref
                  .collection("questions")
                  .orderBy("votes", "desc")
                  .get(),
            ])

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

         for (const rating of ratings) {
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
         }

         // Extraction of snap Data
         const getMostCommonUniversities = (students: UserData[], max = 5) => {
            const universitiesCount = students?.reduce(
               (acc, currentStudent) => {
                  if (!currentStudent?.university?.code) {
                     acc["other"].count += 1
                  } else if (currentStudent?.university?.code in acc) {
                     acc[currentStudent.university.code].count += 1
                  } else {
                     acc[currentStudent.university.code] = {
                        code: currentStudent.university.code,
                        name: currentStudent.university.name,
                        count: 1,
                     }
                  }
                  return acc
               },
               { other: { code: "other", name: "Other", count: 0 } }
            )

            const universitiesArray = Object.keys(universitiesCount)
               .map((key) => universitiesCount[key])
               .filter((university) => university.count > 0)
               .sort((a, b) => b.count - a.count)
            const otherCodes = ["other", "othe"]
            // remove others from the list
            const {
               matches: topNamedUniversities,
               noMatches: otherUniversities,
            } = partition(
               universitiesArray,
               (university, index) =>
                  !otherCodes.includes(university.code) && index < max + 1
            )
            const other = otherUniversities.reduce(
               (acc, curr) => ({ ...acc, count: acc.count + curr.count }),
               {
                  code: "others",
                  name: "Other Universities",
                  count: 0,
               }
            )
            if (other.count > 0) {
               return [...topNamedUniversities, other]
            }
            return topNamedUniversities
         }

         const participatingStudents =
            (
               await livestreamRepo.getLivestreamUsers(
                  livestreamData.id,
                  "participated"
               )
            ).map((data) => data.user) || []

         const groupPresenter =
            GroupPresenter.createFromDocument(requestingGroupData)

         const rootLevelOfStudyCategory =
            await fieldOfStudyRepo.getFieldsOfStudyAsGroupQuestion(
               "levelOfStudy"
            )
         const rootFieldOfStudyCategory =
            await fieldOfStudyRepo.getFieldsOfStudyAsGroupQuestion(
               "fieldOfStudy"
            )

         const {
            matches: uniStudents,
            noMatches: nonUniStudents,
         }: {
            matches: UserData[]
            noMatches: UserData[]
         } = partition(participatingStudents, (student) =>
            groupPresenter.isUniversityStudent(student)
         )

         const isUniversity = groupPresenter.isUniversity()

         nonUniversityChartData = getPdfCategoryChartData(
            rootFieldOfStudyCategory,
            rootLevelOfStudyCategory,
            isUniversity ? nonUniStudents : participatingStudents,
            false
         )

         if (groupPresenter.isUniversity()) {
            const groupFieldOfStudyQuestion =
               await groupRepo.getFieldOrLevelOfStudyGroupQuestion(
                  requestingGroupData.id,
                  "fieldOfStudy"
               )

            const groupLevelOfStudyQuestion =
               await groupRepo.getFieldOrLevelOfStudyGroupQuestion(
                  requestingGroupData.id,
                  "levelOfStudy"
               )
            universityChartData = getPdfCategoryChartData(
               groupFieldOfStudyQuestion,
               groupLevelOfStudyQuestion,
               uniStudents,
               true
            )
         }
         const speakers = livestreamData.speakers || []

         const questions =
            mapFirestoreDocuments<LivestreamQuestion>(questionsSnap)

         const polls = mapFirestoreDocuments<LivestreamPoll>(pollsSnap)

         const groups = await groupRepo.getGroupsByIds(livestreamGroupIds)

         for (const groupData of groups) {
            const presenter = GroupPresenter.createFromDocument(groupData)
            const isUniversity = presenter.isUniversity()
            const numberOfStudentsFromUniversity = isUniversity
               ? participatingStudents.filter((user) =>
                    presenter.isUniversityStudent(user)
                 ).length
               : 0

            const hostData = {
               id: presenter.id,
               hostName: presenter.universityName,
               groupId: presenter.id,
               hostLogoUrl: presenter.logoUrl,
               isUniversity,
               numberOfStudentsFromUniversity: numberOfStudentsFromUniversity,
            }

            hostsData.push(hostData)
         }
         const totalParticipatingWithoutData = universityChartData
            ? (universityChartData?.totalWithoutStats || 0) +
              (nonUniversityChartData?.totalWithoutStats || 0)
            : nonUniversityChartData?.totalWithoutStats || 0

         return {
            hostsData,
            universityChartData,
            nonUniversityChartData,
            summary: {
               totalParticipatingWithoutData: totalParticipatingWithoutData,
               totalParticipating: participatingStudents.length,
               requestingGroupId: targetGroupId,
               requestingGroup: requestingGroupData,
               speakers,
               totalStudentsInTalentPool: talentPoolSnap.size,
               ratings: ratings,
               livestream: livestreamData,
               questions,
               polls,
               numberOfIcons: iconsSnap.size,
               mostCommonUniversities: getMostCommonUniversities(
                  participatingStudents,
                  5
               ),
            },
         } as PdfReportData
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

export const sendDashboardInviteEmail = functions.https.onRequest(
   async (req, res) => {
      setHeaders(req, res)

      const email = {
         TemplateId: process.env.POSTMARK_TEMPLATE_GROUP_ADMIN_INVITATION,
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

export const updateUserDocAdminStatus = functions.firestore
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

export const joinGroupDashboard = functions.https.onCall(
   async (data, context) => {
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
               adminEmails: admin.firestore.FieldValue.arrayUnion(
                  data.userEmail
               ),
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
   }
)
