import { UserData } from "@careerfairy/shared-lib/dist/users"
import {
   Group,
   GROUP_DASHBOARD_ROLE,
} from "@careerfairy/shared-lib/dist/groups"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { GroupPresenter } from "@careerfairy/shared-lib/dist/groups/GroupPresenter"
import {
   getPdfCategoryChartData,
   PdfCategoryChartData,
   PdfReportData,
} from "@careerfairy/shared-lib/dist/groups/pdf-report"
import {
   fieldOfStudyRepo,
   groupRepo,
   livestreamsRepo,
} from "./api/repositories"

import {
   getArrayDifference,
   getDateString,
   getRatingsAverage,
   makeRequestingGroupIdFirst,
   onCallWrapper,
   partition,
} from "./util"
import { admin } from "./api/firestoreAdmin"
import { marketingTeamEmails } from "./misc/marketingTeamEmails"
import {
   logAndThrow,
   validateData,
   validateUserAuthExists,
   validateUserIsGroupAdminOwnerRole,
} from "./lib/validations"
import { GroupDashboardInvite } from "@careerfairy/shared-lib/dist/groups/GroupDashboardInvite"
import { mixed, object, string } from "yup"
import { auth } from "firebase-admin"
import functions = require("firebase-functions")

/* eslint-disable @typescript-eslint/no-var-requires */
const { client } = require("./api/postmark")

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

/* eslint-disable camelcase */
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
         } as unknown as LivestreamEvent

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
               await livestreamsRepo.getLivestreamUsers(
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

         const questions = questionsSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
         }))

         const polls = pollsSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
         }))

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

export const sendDashboardInviteEmail_v2 = functions.https.onCall(
   onCallWrapper(async (data, context) => {
      // user needs to be signed in
      await validateUserAuthExists(context)

      await validateData(
         data,
         object({
            recipientEmail: string().email().required(),
            groupName: string().required(),
            senderFirstName: string().required(),
            groupId: string().required(),
            role: mixed<GROUP_DASHBOARD_ROLE>()
               .oneOf(Object.values(GROUP_DASHBOARD_ROLE))
               .required(),
         })
      )

      //
      const { recipientEmail, groupName, senderFirstName, groupId, role } = data

      // Check if the user exists in our platform, allow fail
      const authUser = await auth()
         .getUserByEmail(recipientEmail)
         .catch(() => null)

      if (authUser) {
         const isAlreadyGroupMember = checkIfAuthUserHasGroupAdminRole(
            authUser.customClaims,
            groupId
         )

         // If the user exists and is already a member of the group, throw an error
         if (isAlreadyGroupMember) {
            logAndThrow(
               `A member with email ${recipientEmail} is already a member of group ${groupId}`
            )
         }
      }

      // If the user does not exist, send an invite email

      const newInvite = await groupRepo.createGroupDashboardInvite(
         groupId,
         recipientEmail,
         role
      )

      const inviteLink = buildInviteLink(
         newInvite.id,
         context.rawRequest.headers.origin,
         authUser ? "login" : "signup"
      )

      const email = {
         TemplateId: process.env.POSTMARK_TEMPLATE_GROUP_ADMIN_INVITATION,
         From: "CareerFairy <noreply@careerfairy.io>",
         To: recipientEmail,
         TemplateModel: {
            sender_first_name: senderFirstName,
            group_name: groupName,
            invite_link: inviteLink,
         },
      }

      return client.sendEmailWithTemplate(email)
   })
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
            functions.logger.info("No new admin has been added or removed")
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

// export const joinGroupDashboard = functions.https.onCall(
//    async (data, context) => {
//       const authEmail = context.auth.token.email || null
//
//       if (!authEmail || authEmail !== data.userEmail) {
//          throw new functions.https.HttpsError(
//             "permission-denied",
//             "Unauthorized"
//          )
//       }
//
//       const groupRef = admin
//          .firestore()
//          .collection("careerCenterData")
//          .doc(data.groupId)
//
//       const userRef = admin
//          .firestore()
//          .collection("userData")
//          .doc(data.userEmail)
//
//       const notificationRef = admin
//          .firestore()
//          .collection("notifications")
//          .doc(data.invitationId)
//
//       const notificationDoc = await notificationRef.get()
//       const notification = notificationDoc.data()
//
//       if (
//          notification.details.requester !== data.groupId ||
//          notification.details.receiver !== data.userEmail
//       ) {
//          functions.logger.error(
//             `User ${data.userEmail} trying to connect to group ${data.groupId} did not pass the notification check ${notification.details}`
//          )
//          throw new functions.https.HttpsError(
//             "permission-denied",
//             "Unauthorized"
//          )
//       }
//
//       await admin.firestore().runTransaction((transaction) => {
//          return transaction.get(userRef).then(() => {
//             transaction.update(groupRef, {
//                adminEmails: admin.firestore.FieldValue.arrayUnion(
//                   data.userEmail
//                ),
//             })
//             transaction.update(userRef, {
//                adminIds: admin.firestore.FieldValue.arrayUnion(data.groupId),
//             })
//             const groupAdminRef = admin
//                .firestore()
//                .collection("careerCenterData")
//                .doc(data.groupId)
//                .collection("admins")
//                .doc(data.userEmail)
//             transaction.set(groupAdminRef, {
//                role: "subAdmin",
//             })
//
//             transaction.delete(notificationRef)
//          })
//       })
//    }
// )

export const joinGroupDashboard_v2 = functions.https.onCall(
   async (data, context) => {
      let response: Group = null
      try {
         const token = await validateUserAuthExists(context)

         const { inviteId } = data

         const invitedUserEmail = token.email

         // fetch and validate the invite
         const { groupDashboardInvite, group } =
            await validateGroupDashboardInvite(inviteId, invitedUserEmail)

         const groupId = groupDashboardInvite.groupId
         const role = groupDashboardInvite.role

         // assign the user to the group
         await groupRepo.grantGroupAdminRole(invitedUserEmail, groupId, role)

         // delete the invite
         await groupRepo.deleteGroupDashboardInviteById(inviteId)

         response = group
      } catch (e) {
         logAndThrow(e)
      }
      return response // return the group id so the client can redirect to the group dashboard
   }
)

export const deleteGroupAdminDashboardInvite = functions.https.onCall(
   async (data, context) => {
      try {
         const { inviteId, groupId } = data
         const userEmail = context.auth.token.email
         await validateUserIsGroupAdminOwnerRole(userEmail, groupId)

         // delete the invite
         await groupRepo.deleteGroupDashboardInviteById(inviteId)

         return true
      } catch (e) {
         logAndThrow(e)
      }
      return true
   }
)

/**
 * Validates if the invite is valid
 *
 * Checks if the user is authenticated and is a CF Admin
 * @param inviteId - the ID of the invite document
 * @param invitedUserEmail - the email of the user who is accepting the invite
 */
export async function validateGroupDashboardInvite(
   inviteId: string,
   invitedUserEmail: string
): Promise<{
   group: Group
   groupDashboardInvite: GroupDashboardInvite
}> {
   const groupDashboardInvite = await groupRepo.getGroupDashboardInviteById(
      inviteId
   )

   if (!groupDashboardInvite) {
      logAndThrow("Group dashboard invite does not exist", inviteId)
   }

   const isValid = groupRepo.checkIfGroupDashboardInviteIsValid(
      groupDashboardInvite,
      invitedUserEmail
   )

   if (!isValid) {
      logAndThrow("Group dashboard invite is not valid", inviteId)
   }

   const group = await groupRepo.getGroupById(groupDashboardInvite.groupId)

   if (!group) {
      logAndThrow("Group does not exist", groupDashboardInvite.groupId)
   }

   const isValidRole = Object.values(GROUP_DASHBOARD_ROLE).includes(
      groupDashboardInvite.role
   )

   if (!isValidRole) {
      logAndThrow("Invalid role", groupDashboardInvite.role)
   }

   const isValidEmail = groupDashboardInvite.invitedEmail === invitedUserEmail

   if (!isValidEmail) {
      logAndThrow(
         "Invited email does not match the email of the user accepting the invite",
         groupDashboardInvite.invitedEmail
      )
   }

   return { group, groupDashboardInvite }
}

const buildInviteLink = (
   inviteId: string,
   baseUrl: string,
   onBoardingFlow: "login" | "signup"
) => {
   return `${baseUrl}/group/invite/${inviteId}?flow=${onBoardingFlow}`
}

const checkIfAuthUserHasGroupAdminRole = (
   customClaims: { [p: string]: any },
   groupId: string
) => {
   return Boolean(customClaims?.groupAdmins?.[groupId])
}
