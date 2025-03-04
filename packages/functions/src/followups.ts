import functions = require("firebase-functions")
import { EUROPEAN_COUNTRY_CODES } from "@careerfairy/shared-lib/constants/forms"
import { TagValuesLookup } from "@careerfairy/shared-lib/constants/tags"
import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { Group } from "@careerfairy/shared-lib/groups"
import {
   LiveStreamEventWithUsersLivestreamData,
   LivestreamEvent,
} from "@careerfairy/shared-lib/livestreams"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { SparkInteractionSources } from "@careerfairy/shared-lib/sparks/telemetry"
import {
   addUtmTagsToLink,
   companyNameSlugify,
} from "@careerfairy/shared-lib/utils"
import { log } from "firebase-functions/logger"
import { onCall, onRequest } from "firebase-functions/v2/https"
import { onSchedule } from "firebase-functions/v2/scheduler"
import { DateTime } from "luxon"
import {
   customJobRepo,
   groupRepo,
   livestreamsRepo,
   notificationRepo,
   sparkRepo,
} from "./api/repositories"
import {
   CUSTOMERIO_EMAIL_TEMPLATES,
   EmailNotificationRequestData,
} from "./lib/notifications/EmailTypes"
import { isLocalEnvironment } from "./util"

type FollowUpTemplateId =
   | typeof CUSTOMERIO_EMAIL_TEMPLATES.LIVESTREAM_FOLLOWUP_ATTENDEES
   | typeof CUSTOMERIO_EMAIL_TEMPLATES.LIVESTREAM_FOLLOWUP_NON_ATTENDEES

export const sendReminderEmailAboutApplicationLink = onCall(
   {
      memory: "8GiB",
      timeoutSeconds: 540,
   },
   async (request) => {
      const data = request.data
      const uid = request.auth?.uid
      log("data", data)

      if (!uid) {
         throw new functions.https.HttpsError(
            "unauthenticated",
            "User not authenticated"
         )
      }

      await notificationRepo.sendEmailNotifications([
         {
            to: data.recipient,
            templateId:
               CUSTOMERIO_EMAIL_TEMPLATES.LIVESTREAM_FOLLOWUP_APPLICATION_LINK,
            userAuthId: uid,
            templateData: {
               application_link: addUtmTagsToLink({
                  link: data.application_link,
                  campaign: "jobApplication",
                  content: data.position_name,
               }),
               position_name: data.position_name,
            },
         },
      ])
   }
)

type LivestreamFollowUpAdditionalData = {
   groups: {
      groupsByLivestreamId: Record<string, Group>
      groupSparks: Record<string, Spark[]>
   }
   livestream: {
      jobsByLivestreamId: Record<string, CustomJob[]>
   }
}

/**
 * Every day at 9 AM, check all the livestreams that ended the day before and send a reminder to all the non-attendees at 11 AM.
 */
export const sendReminderToNonAttendees = onSchedule(
   {
      // when sending large batches, this function can take a while to finish
      timeoutSeconds: 540,
      memory: "8GiB",
      schedule: "0 11 * * *",
      timeZone: "Europe/Zurich",
   },
   async () => {
      await sendAttendeesReminder(
         CUSTOMERIO_EMAIL_TEMPLATES.LIVESTREAM_FOLLOWUP_NON_ATTENDEES
      )
   }
)

export const sendReminderToAttendees = onSchedule(
   {
      // when sending large batches, this function can take a while to finish
      timeoutSeconds: 540,
      memory: "8GiB",
      schedule: "0 11 * * *",
      timeZone: "Europe/Zurich",
   },
   async () => {
      await sendAttendeesReminder(
         CUSTOMERIO_EMAIL_TEMPLATES.LIVESTREAM_FOLLOWUP_ATTENDEES
      )
   }
)

export const testSendReminderToNonAttendees = onRequest(async (req, res) => {
   // Update ids according to testing data
   const testEvents = await livestreamsRepo.getLivestreamsByIds([
      "LQTy4JdeRBqGUtULeNir",
      // "6UX9IBp6otoVwGwis8EJ",
   ])

   // Toggle between attendees or non-attendees
   await sendAttendeesReminder(
      CUSTOMERIO_EMAIL_TEMPLATES.LIVESTREAM_FOLLOWUP_NON_ATTENDEES,
      testEvents
   )

   res.status(200).send("Test non attendees done")
})

const getEmailTemplateMessages = (
   templateId: FollowUpTemplateId,
   streams: LiveStreamEventWithUsersLivestreamData[],
   additionalData: LivestreamFollowUpAdditionalData
): EmailNotificationRequestData<FollowUpTemplateId>[] => {
   const host = isLocalEnvironment()
      ? "http://localhost:3000"
      : "https://careerfairy.io"

   const templateMessages: EmailNotificationRequestData<FollowUpTemplateId>[] =
      []

   streams.forEach((stream) => {
      const streamGroup = additionalData.groups.groupsByLivestreamId[stream.id]
      const speakers = stream.speakers ?? []

      const groupSparks = additionalData.groups.groupSparks[streamGroup.id]
         .sort((sparkA, sparkB) => {
            return sparkB.publishedAt.toMillis() - sparkA.publishedAt.toMillis()
         })
         .slice(0, 3)
         .map((spark) => {
            return {
               question: spark.question,
               category_id: spark.category.name,
               thumbnailUrl: spark.video.thumbnailUrl,
               url: addUtmTagsToLink({
                  link: `${host}/sparks/${
                     spark.id
                  }?companyName=${companyNameSlugify(
                     streamGroup.universityName
                  )}&groupId=${streamGroup.id}&interactionSource=${
                     SparkInteractionSources.Livestream_Follow_Up
                  }`,
                  source: "careerfairy",
                  medium: "email",
                  campaign: "event-followup",
                  content: stream.title,
               }),
            }
         })

      const streamSpeakers = speakers.slice(0, 4).map((speaker) => {
         const speakerLink = addUtmTagsToLink({
            link: `${host}/portal/livestream/${stream.id}/speaker-details/${speaker.id}`,
            source: "careerfairy",
            medium: "email",
            campaign: "event-followup",
            content: stream.title,
         })

         return {
            name: `${speaker.firstName} ${speaker.lastName}`,
            position: speaker.position,
            avatarUrl: speaker.avatar,
            url: speakerLink,
            linkedInUrl: speaker.linkedInUrl,
         }
      })

      const streamJobs = additionalData.livestream.jobsByLivestreamId[
         stream.id
      ].map((job) => {
         return {
            title: job.title,
            jobType: job.jobType,
            businessFunctionsTags: (
               job.businessFunctionsTagIds?.map(
                  (tag) => TagValuesLookup[tag]
               ) ?? []
            ).join(", "),
            deadline: DateTime.fromJSDate(job.deadline.toDate()).toFormat(
               "dd LLL yyyy"
            ),
            url: addUtmTagsToLink({
               link: `${host}/portal/livestream/${stream.id}/job-details/${job.id}`,
               source: "careerfairy",
               medium: "email",
               campaign: "event-followup",
               content: stream.title,
            }),
         }
      })

      stream.usersLivestreamData.forEach((streamUserData) => {
         const userInEU = EUROPEAN_COUNTRY_CODES.includes(
            streamUserData.user.universityCountryCode
         )

         const speakers = streamSpeakers.map((speaker) => ({
            ...speaker,
            url:
               userInEU && speaker.linkedInUrl
                  ? speaker.linkedInUrl
                  : speaker.url,
         }))

         templateMessages.push({
            to: streamUserData.user.userEmail,
            templateId: templateId,
            userAuthId: streamUserData.user.id,
            templateData: {
               livestream: {
                  company: streamGroup.universityName,
                  companyBannerImageUrl: streamGroup.bannerImageUrl,
                  details_url: addUtmTagsToLink({
                     link: `${host}/portal/livestream/${stream.id}`,
                     source: "careerfairy",
                     medium: "email",
                     campaign: "event-followup",
                     content: stream.title,
                  }),
               },
               jobs: streamJobs,
               speakers: speakers,
               sparks: groupSparks,
               allowsRecording: !stream.denyRecordingAccess,
            },
         })
      })
   })

   return templateMessages
}

const sendAttendeesReminder = async (
   templateId: FollowUpTemplateId,
   events?: LivestreamEvent[]
) => {
   try {
      const yesterdayLivestreams = events?.length
         ? events
         : await livestreamsRepo.getYesterdayLivestreams()

      if (yesterdayLivestreams.length) {
         const livestreamsToRemind = await yesterdayLivestreams.reduce<
            Promise<LiveStreamEventWithUsersLivestreamData[]>
         >(async (acc, livestream) => {
            const livestreamPresenter =
               LivestreamPresenter.createFromDocument(livestream)

            if (
               !livestreamPresenter.isTest() &&
               !livestreamPresenter.isLive() &&
               livestreamPresenter.streamHasFinished()
            ) {
               functions.logger.log(
                  `Detected livestream ${livestreamPresenter.title} has ended yesterday`
               )

               const attendeesData =
                  templateId ===
                  CUSTOMERIO_EMAIL_TEMPLATES.LIVESTREAM_FOLLOWUP_ATTENDEES
                     ? await livestreamsRepo.getAttendees(livestream.id)
                     : await livestreamsRepo.getNonAttendees(livestream.id)

               if (attendeesData.length) {
                  const livestreamAttendees = {
                     ...livestream,
                     usersLivestreamData: attendeesData,
                  }

                  functions.logger.log(
                     `Will send the reminder to ${attendeesData.length} users related to the Livestream ${livestreamPresenter.title}`
                  )

                  return [...(await acc), livestreamAttendees]
               } else {
                  functions.logger.log(
                     `No Attendees were found on ${livestreamPresenter.title}`
                  )
               }
            } else {
               functions.logger.log(
                  `The livestream ${livestreamPresenter.title} has not ended yet`
               )
            }
            return await acc
         }, Promise.resolve([]))

         const groupsByEventIds: Record<string, Group> = {}

         const groupSparks: Record<string, Spark[]> = {}

         const livestreamJobs: Record<string, CustomJob[]> = {}

         await Promise.all(
            livestreamsToRemind.map((event) =>
               groupRepo.getGroupsByIds(event.groupIds).then((groups) => {
                  groupsByEventIds[event.id] =
                     groups.find((group) => !group.universityCode) ??
                     groups.at(0)
               })
            )
         )

         const groupSparksPromises = Object.values(groupsByEventIds).map(
            async (group) => {
               groupSparks[group.id] = group.publicSparks
                  ? (await sparkRepo.getSparksByGroupId(group.id)) ?? []
                  : []
            }
         )

         const livestreamJobsPromises = livestreamsToRemind.map(
            async (event) => {
               livestreamJobs[event.id] = event.hasJobs
                  ? (await customJobRepo.getCustomJobsByLivestreamId(
                       event.id
                    )) ?? []
                  : []
            }
         )

         await Promise.all([...groupSparksPromises, ...livestreamJobsPromises])

         const additionalData: LivestreamFollowUpAdditionalData = {
            groups: {
               groupsByLivestreamId: groupsByEventIds,
               groupSparks: groupSparks,
            },
            livestream: {
               jobsByLivestreamId: livestreamJobs,
            },
         }

         const emailTemplates = getEmailTemplateMessages(
            templateId,
            livestreamsToRemind,
            additionalData
         )

         await notificationRepo.sendEmailNotifications(emailTemplates)

         functions.logger.log("attendees reminders sent")
      } else {
         functions.logger.log("No livestream has ended yesterday")
      }
   } catch (error) {
      functions.logger.error(
         "error in sending reminder to attendees when livestreams ends",
         error
      )
      throw new functions.https.HttpsError("unknown", error)
   }
}
