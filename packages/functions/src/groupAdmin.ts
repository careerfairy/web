import { UserData } from "@careerfairy/shared-lib/users"
import {
   Group,
   GROUP_DASHBOARD_ROLE,
   GroupAdmin,
} from "@careerfairy/shared-lib/groups"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { GroupPresenter } from "@careerfairy/shared-lib/groups/GroupPresenter"
import {
   getPdfCategoryChartData,
   PdfCategoryChartData,
   PdfReportData,
} from "@careerfairy/shared-lib/groups/pdf-report"
import {
   fieldOfStudyRepo,
   groupRepo,
   livestreamsRepo,
} from "./api/repositories"

import {
   getDateString,
   getRatingsAverage,
   makeRequestingGroupIdFirst,
   onCallWrapper,
   partition,
} from "./util"
import {
   logAndThrow,
   validateData,
   validateUserAuthExists,
   validateUserIsGroupAdminOwnerRole,
} from "./lib/validations"
import {
   GroupDashboardInvite,
   WRONG_EMAIL_IN_INVITE_ERROR_MESSAGE,
} from "@careerfairy/shared-lib/groups/GroupDashboardInvite"
import { array, boolean, mixed, object, string } from "yup"
import functions = require("firebase-functions")
import { addUtmTagsToLink } from "@careerfairy/shared-lib/utils"
import { client } from "./api/postmark"
import config from "./config"
import { firestore, auth } from "./api/firestoreAdmin"
import { UserRecord } from "firebase-admin/auth"

export const sendDraftApprovalRequestEmail = functions
   .region(config.region)
   .https.onCall(async (data, context) => {
      try {
         const {
            senderName,
            livestream,
            submitTime,
            // TODO Update the cloud function to send the sender an email of the draft they submitted
            // senderEmail,
         } = data

         const admins: GroupAdmin[] = []

         if (livestream.groupIds) {
            for (const groupId of livestream.groupIds) {
               const newAdmins = await groupRepo.getGroupAdmins(groupId)
               if (newAdmins) {
                  admins.push(...newAdmins)
               }
            }
         }

         const origin =
            context?.rawRequest?.headers?.origin || "https://careerfairy.io"

         const adminsInfo = admins.map((admin) => {
            return {
               groupId: admin.groupId,
               email: admin.email,
               eventDashboardLink: `${origin}/group/${admin.groupId}/admin/events?eventId=${livestream.id}`,
               nextLivestreamsLink: `${origin}/next-livestreams/${admin.groupId}?livestreamId=${livestream.id}`,
            }
         })

         functions.logger.log("admins Info in approval request", adminsInfo)

         const emails = adminsInfo.map(({ email, eventDashboardLink }) => ({
            TemplateId: Number(
               process.env.POSTMARK_TEMPLATE_DRAFT_STREAM_APPROVAL_REQUEST
            ),
            From: "CareerFairy <noreply@careerfairy.io>",
            To: email,
            TemplateModel: {
               sender_name: senderName,
               livestream_title: livestream.title,
               livestream_company_name: livestream.company,
               draft_stream_link: addUtmTagsToLink({
                  link: eventDashboardLink,
               }),
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

export const sendNewlyPublishedEventEmail = functions
   .region(config.region)
   .https.onCall(async (data, context) => {
      try {
         const { senderName, stream, submitTime } = data

         const adminsInfo = await livestreamsRepo.getAllGroupAdminInfoByStream(
            stream.id,
            context.rawRequest.headers.origin
         )

         functions.logger.log(
            "admins Info in newly published event",
            adminsInfo
         )

         const emails = adminsInfo.map(
            ({ email, eventDashboardLink, nextLivestreamsLink }) => ({
               TemplateId: Number(
                  process.env.POSTMARK_TEMPLATE_NEWLY_PUBLISHED_EVENT
               ),
               From: "CareerFairy <noreply@careerfairy.io>",
               To: email,
               TemplateModel: {
                  sender_name: senderName,
                  dashboard_link: addUtmTagsToLink({
                     link: eventDashboardLink,
                  }),
                  next_livestreams_link: addUtmTagsToLink({
                     link: nextLivestreamsLink,
                     campaign: "shareEvents",
                  }),
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
   })

export const getLivestreamReportData = functions
   .region(config.region)
   .https.onCall(async (data, context) => {
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

      const groupSnap = await firestore
         .collection("careerCenterData")
         .doc(targetGroupId)
         .get()

      const streamSnap = await firestore
         .collection("livestreams")
         .doc(targetStreamId)
         .get()

      const userSnap = await firestore
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
            startDateString: getDateString(
               streamSnap.data() as LivestreamEvent
            ),
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
               firestore
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
            )?.map((data) => data.user) || []

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
   })

export const sendDashboardInviteEmail = functions
   .region(config.region)
   .https.onCall(
      onCallWrapper(async (data, context) => {
         // user needs to be signed in

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

         const { recipientEmail, groupName, senderFirstName, groupId, role } =
            data

         const targetEmail = recipientEmail.trim().toLowerCase()

         const userEmail = context.auth.token.email
         await validateUserIsGroupAdminOwnerRole(userEmail, groupId)

         // Check if the user exists in our platform, allow fail
         const authUser = await auth
            .getUserByEmail(targetEmail)
            .catch(() => null)

         if (authUser) {
            const isAlreadyGroupMember = checkIfAuthUserHasGroupAdminRole(
               authUser,
               groupId
            )

            // If the user exists and is already a member of the group, throw an error
            if (isAlreadyGroupMember) {
               logAndThrow(
                  `A member with email ${targetEmail} is already a member of group`,
                  {
                     groupId,
                  }
               )
            }
         }

         // If the user does not exist, send an invitation email

         const newInvite = await groupRepo.createGroupDashboardInvite(
            groupId,
            targetEmail,
            role
         )

         const inviteLink = buildInviteLink({
            inviteId: newInvite.id,
            origin: context.rawRequest.headers.origin,
            onBoardingFlow: authUser ? "login" : "signup",
         })

         const email = {
            TemplateId: Number(
               process.env.POSTMARK_TEMPLATE_GROUP_ADMIN_INVITATION
            ),
            From: "CareerFairy <noreply@careerfairy.io>",
            To: targetEmail,
            TemplateModel: {
               sender_first_name: senderFirstName,
               group_name: groupName,
               invite_link: addUtmTagsToLink({ link: inviteLink }),
            },
         }

         return client.sendEmailWithTemplate(email)
      })
   )

export const joinGroupDashboard = functions
   .region(config.region)
   .https.onCall(async (data, context) => {
      let response: Group = null
      try {
         const token = await validateUserAuthExists(context)

         const { inviteId } = data

         const currentUserEmail = token.email

         // fetch and validate the invite
         const { groupDashboardInvite, group, isAlreadyGroupMember } =
            await validateGroupDashboardInvite(inviteId, currentUserEmail)

         if (!isAlreadyGroupMember) {
            // If the user is not already a member of the group, add them to the group
            const role = groupDashboardInvite.role

            // Make the user an admin of the group
            await groupRepo.setAdminRole(currentUserEmail, group, role)
         }

         // delete the invite
         await groupRepo.deleteGroupDashboardInviteById(inviteId)

         response = group
      } catch (e) {
         logAndThrow(e)
      }
      return response // return the group id so the client can redirect to the group dashboard
   })

export const createGroup = functions
   .region(config.region)
   .https.onCall(async (data, context) => {
      let newGroup: Group = null
      try {
         const token = await validateUserAuthExists(context)
         await validateData(
            data,
            object({
               group: object({
                  universityName: string().required(),
                  logoUrl: string().required(),
                  description: string().required(),
                  universityCode: string().optional(),
               }),
               groupQuestions: array().of(
                  object({
                     name: string().required(),
                     hidden: boolean().optional(),
                     questionType: string()
                        .oneOf(["levelOfStudy", "fieldOfStudy", "custom"])
                        .required(),
                     options: object().optional(), // Yup has no support for validating dictionaries
                  })
               ),
            })
         )
         const { group, groupQuestions } = data
         newGroup = await groupRepo.createGroup(
            group,
            token.email,
            groupQuestions
         )
      } catch (e) {
         logAndThrow(e)
      }
      return newGroup
   })

export const changeRole = functions
   .region(config.region)
   .https.onCall(async (data, context) => {
      try {
         await validateData(
            data,
            object({
               groupId: string().required(),
               email: string().email().required(),
               newRole: string()
                  .oneOf(Object.values(GROUP_DASHBOARD_ROLE))
                  .required(),
            })
         )
         const { groupId, email, newRole } = data

         const { group } = await validateUserIsGroupAdminOwnerRole(
            context.auth.token.email,
            groupId
         )

         await groupRepo.setAdminRole(email, group, newRole)
      } catch (e) {
         logAndThrow(e)
      }
      return null
   })

/*
 * Keep the kick and change role functions separate, to avoid the wrong user being kicked
 * */
export const kickFromDashboard = functions
   .region(config.region)
   .https.onCall(async (data, context) => {
      try {
         await validateData(
            data,
            object({
               groupId: string().required(),
               email: string().email().required(),
            })
         )
         const { groupId, email } = data

         const { group } = await validateUserIsGroupAdminOwnerRole(
            context.auth.token.email,
            groupId
         )

         await groupRepo.setAdminRole(email, group, null)
      } catch (e) {
         logAndThrow(e)
      }
      return null
   })

/**
 * Validates if the invite is valid
 *
 * Checks if the user is authenticated and is a CF Admin
 * @param inviteId - the ID of the invite document
 * @param currentUserEmail - the email of the user who is trying to accept the invite
 */
export async function validateGroupDashboardInvite(
   inviteId: string,
   currentUserEmail: string
): Promise<{
   group: Group
   groupDashboardInvite: GroupDashboardInvite
   isAlreadyGroupMember: boolean
}> {
   const groupDashboardInvite = await groupRepo.getGroupDashboardInviteById(
      inviteId
   )

   if (!groupDashboardInvite) {
      logAndThrow("Group dashboard invite does not exist", inviteId)
   }

   const isValid = groupRepo.checkIfGroupDashboardInviteIsValid(
      groupDashboardInvite,
      currentUserEmail
   )

   if (!isValid) {
      logAndThrow("This invite is not invalid", inviteId)
   }

   const group = await groupRepo.getGroupById(groupDashboardInvite.groupId)
   const authUser = await auth.getUserByEmail(currentUserEmail)

   const isAlreadyGroupMember = checkIfAuthUserHasGroupAdminRole(
      authUser,
      group.id
   )

   if (isAlreadyGroupMember) {
      functions.logger.warn("You are already a member of this group", {
         group,
         authUser,
      })
   }

   if (!group) {
      logAndThrow(
         "The group from the given invite code cannot be found",
         groupDashboardInvite.groupId
      )
   }

   const isValidRole = Object.values(GROUP_DASHBOARD_ROLE).includes(
      groupDashboardInvite.role
   )

   if (!isValidRole) {
      logAndThrow("Invalid role", groupDashboardInvite.role)
   }

   const isValidEmail =
      groupDashboardInvite.invitedEmail.trim().toLowerCase() ===
      currentUserEmail.trim().toLowerCase()

   if (!isValidEmail) {
      logAndThrow(WRONG_EMAIL_IN_INVITE_ERROR_MESSAGE, {
         invitedEmail: groupDashboardInvite.invitedEmail,
         currentUserEmail,
      })
   }

   return { group, groupDashboardInvite, isAlreadyGroupMember }
}

type InviteLinkOptions = {
   inviteId: string
   origin: string
   onBoardingFlow: "login" | "signup"
}
const buildInviteLink = (args: InviteLinkOptions) => {
   return `${args.origin}/group/invite/${args.inviteId}?flow=${args.onBoardingFlow}`
}

const checkIfAuthUserHasGroupAdminRole = (
   authUser: UserRecord,
   groupId: string
) => {
   return Boolean(authUser?.customClaims?.adminGroups?.[groupId])
}
