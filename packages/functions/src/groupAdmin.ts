import { Group, GROUP_DASHBOARD_ROLE } from "@careerfairy/shared-lib/groups"
import { GroupPresenter } from "@careerfairy/shared-lib/groups/GroupPresenter"
import {
   getPdfCategoryChartData,
   PdfCategoryChartData,
   PdfReportData,
} from "@careerfairy/shared-lib/groups/pdf-report"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { UserData } from "@careerfairy/shared-lib/users"
import {
   fieldOfStudyRepo,
   groupRepo,
   livestreamsRepo,
   notificationService,
} from "./api/repositories"

import { SendNewlyPublishedEventEmailFnArgs } from "@careerfairy/shared-lib/functions/types"
import {
   GroupDashboardInvite,
   WRONG_EMAIL_IN_INVITE_ERROR_MESSAGE,
} from "@careerfairy/shared-lib/groups/GroupDashboardInvite"
import { addUtmTagsToLink } from "@careerfairy/shared-lib/utils"
import { mainProductionDomainWithProtocol } from "@careerfairy/shared-lib/utils/urls"
import { UserRecord } from "firebase-admin/auth"
import { logger } from "firebase-functions/v2"
import { HttpsError, onCall } from "firebase-functions/v2/https"
import { array, boolean, InferType, mixed, object, string } from "yup"
import { auth, firestore } from "./api/firestoreAdmin"
import config from "./config"
import { CUSTOMERIO_EMAIL_TEMPLATES } from "./lib/notifications/EmailTypes"
import {
   logAndThrow,
   validateData,
   validateUserAuthExists,
   validateUserIsGroupAdminOwnerRole,
} from "./lib/validations"
import { withMiddlewares } from "./middlewares-gen2/onCall"
import { userIsGroupAdminMiddleware } from "./middlewares-gen2/onCall/validations"
import {
   getDateString,
   getRatingsAverage,
   makeRequestingGroupIdFirst,
   onCallWrapperV2,
   partition,
} from "./util"
import functions = require("firebase-functions")

// Using the improved type-inferring middleware system
export const sendNewlyPublishedEventEmail = onCall(
   withMiddlewares(
      [userIsGroupAdminMiddleware<SendNewlyPublishedEventEmailFnArgs>()],
      async (request) => {
         try {
            const { livestreamId } = request.data

            const group = request.data.group

            const stream = await livestreamsRepo.getById(livestreamId)

            if (!stream) {
               throw new HttpsError("not-found", "Livestream not found")
            }

            const adminsInfo =
               await livestreamsRepo.getAllGroupAdminInfoByStream(
                  stream.id,
                  request.rawRequest.headers.origin
               )

            logger.log("admins Info in newly published event", adminsInfo)

            await notificationService.sendEmailNotifications(
               adminsInfo.map((admin) => ({
                  templateId: CUSTOMERIO_EMAIL_TEMPLATES.LIVE_STREAM_PUBLISH,
                  templateData: {
                     dashboardUrl: addUtmTagsToLink({
                        link: admin.eventDashboardLink,
                     }),
                     livestream: {
                        company: stream.company,
                        companyLogoUrl: stream.companyLogoUrl,
                        companyBannerImageUrl: group.bannerImageUrl,
                        title: stream.title,
                        url: addUtmTagsToLink({
                           link: admin.nextLivestreamsLink,
                           campaign: "shareEvents",
                        }),
                     },
                  },
                  identifiers: {
                     email: admin.email,
                  },
                  to: admin.email,
               }))
            )
            return { success: true }
         } catch (e) {
            logger.error("e:" + e)
            throw new HttpsError("unknown", e)
         }
      }
   )
)

export const getLivestreamReportData = functions
   .region(config.region)
   .runWith({
      timeoutSeconds: 540, // 9 minutes (max)
      memory: "512MB",
   })
   .https.onCall(async (data, context) => {
      const { targetStreamId, targetGroupId, userEmail } = data
      const hostsData: PdfReportData["hostsData"] = []
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

         const rootLevelOfStudyCategory =
            await fieldOfStudyRepo.getFieldsOfStudyAsGroupQuestion(
               "levelOfStudy"
            )
         const rootFieldOfStudyCategory =
            await fieldOfStudyRepo.getFieldsOfStudyAsGroupQuestion(
               "fieldOfStudy"
            )

         nonUniversityChartData = getPdfCategoryChartData(
            rootFieldOfStudyCategory,
            rootLevelOfStudyCategory,
            participatingStudents
         )

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
         const totalParticipatingWithoutData =
            nonUniversityChartData?.totalWithoutStats || 0

         return {
            hostsData,
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

const schema = object({
   recipientEmail: string().email().required(),
   groupName: string().required(),
   senderFirstName: string().required(),
   groupId: string().required(),
   role: mixed<GROUP_DASHBOARD_ROLE>()
      .oneOf(Object.values(GROUP_DASHBOARD_ROLE))
      .required(),
})

type SendDashboardInviteEmailData = InferType<typeof schema>

export const sendDashboardInviteEmail = onCall<SendDashboardInviteEmailData>(
   onCallWrapperV2(async (request) => {
      // user needs to be signed in
      const data = request.data
      const context = request.auth

      await validateData(data, schema)

      const { recipientEmail, groupName, senderFirstName, groupId, role } = data

      const targetEmail = recipientEmail.trim().toLowerCase()

      const userEmail = context.token.email
      await validateUserIsGroupAdminOwnerRole(userEmail, groupId)

      // Check if the user exists in our platform, allow fail
      const authUser = await auth.getUserByEmail(targetEmail).catch(() => null)

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

      const baseUrl =
         request.rawRequest.headers.origin || mainProductionDomainWithProtocol

      const inviteLink = buildInviteLink({
         inviteId: newInvite.id,
         origin: baseUrl,
         onBoardingFlow: authUser ? "login" : "signup",
      })

      return notificationService.sendEmailNotification({
         templateId: CUSTOMERIO_EMAIL_TEMPLATES.GROUP_INVITATION,
         templateData: {
            invite_link: addUtmTagsToLink({ link: inviteLink }),
            group_name: groupName,
            group_link: `${baseUrl}/group/${groupId}/admin`,
            sender_first_name: senderFirstName,
         },
         identifiers: {
            email: targetEmail,
         },
         to: targetEmail,
      })
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
