import functions = require("firebase-functions")
import { EUROPEAN_COUNTRY_CODES } from "@careerfairy/shared-lib/constants/forms"
import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import {
   getJobEmailData,
   getSparkEmailData,
   getSpeakerEmailData,
} from "@careerfairy/shared-lib/email/emailData"
import { Group } from "@careerfairy/shared-lib/groups"
import {
   LiveStreamEventWithUsersLivestreamData,
   LivestreamEvent,
   getAuthUidFromUserLivestreamData,
} from "@careerfairy/shared-lib/livestreams"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { SparkInteractionSources } from "@careerfairy/shared-lib/sparks/telemetry"
import { addUtmTagsToLink } from "@careerfairy/shared-lib/utils"
import { log } from "firebase-functions/logger"
import { onCall, onRequest } from "firebase-functions/v2/https"
import { onSchedule } from "firebase-functions/v2/scheduler"
import {
   customJobRepo,
   groupRepo,
   livestreamsRepo,
   notificationService,
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
      log("data", data)

      const { livestreamId, userUid, jobId, userEmail } = data

      if (!userUid || !userEmail) {
         throw new functions.https.HttpsError(
            "unauthenticated",
            "userUid or userEmail is missing"
         )
      }

      const livestream = await livestreamsRepo.getById(livestreamId)

      if (!livestream) {
         throw new functions.https.HttpsError(
            "not-found",
            "Livestream not found"
         )
      }

      const job = await customJobRepo.getCustomJobById(jobId)

      if (!job) {
         throw new functions.https.HttpsError("not-found", "Job not found")
      }

      await notificationService.sendEmailNotifications([
         {
            to: userEmail,
            templateId: CUSTOMERIO_EMAIL_TEMPLATES.APPLY_TO_JOB_LATER,
            identifiers: {
               id: userUid,
            },
            templateData: {
               job: getJobEmailData(job, {
                  baseUrl: request.rawRequest.headers?.origin,
                  livestreamId: livestream.id,
                  utmParams: {
                     campaign: "jobApplication",
                     content: livestream.title,
                  },
               }),
               companyName: livestream.company,
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
export const sendFollowupToNonAttendees = onSchedule(
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

export const sendFollowupToAttendees = onSchedule(
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

export const sendManualFollowup = onRequest(async (req, res) => {
   if (!req.query.livestreamId) {
      res.status(400).send("request.query.livestreamId is required")
      return
   }

   if (
      req.query.templateId !==
         CUSTOMERIO_EMAIL_TEMPLATES.LIVESTREAM_FOLLOWUP_NON_ATTENDEES &&
      req.query.templateId !==
         CUSTOMERIO_EMAIL_TEMPLATES.LIVESTREAM_FOLLOWUP_ATTENDEES
   ) {
      res.status(400).send(
         `Invalid request.query.templateId: ${req.query.templateId} please use one of the following: ${CUSTOMERIO_EMAIL_TEMPLATES.LIVESTREAM_FOLLOWUP_NON_ATTENDEES} or ${CUSTOMERIO_EMAIL_TEMPLATES.LIVESTREAM_FOLLOWUP_ATTENDEES}`
      )
      return
   }

   const livestreamId = req.query.livestreamId as string

   const livestream = await livestreamsRepo.getById(livestreamId)

   if (!livestream) {
      res.status(400).send("request.query.livestreamId is not valid")
      return
   }

   await sendAttendeesReminder(req.query.templateId as FollowUpTemplateId, [
      livestream,
   ])

   res.status(200).send(
      `Sent followups with the template ${req.query.templateId} to ${req.query.livestreamId}`
   )
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
         .map((spark) =>
            getSparkEmailData(spark, {
               baseUrl: host,
               interactionSource: SparkInteractionSources.Livestream_Follow_Up,
               utmParams: {
                  campaign: "event-followup",
                  content: stream.title,
               },
            })
         )

      const streamSpeakers = speakers.slice(0, 4).map((speaker) =>
         getSpeakerEmailData(speaker, {
            baseUrl: host,
            livestreamId: stream.id,
            utmParams: {
               campaign: "event-followup",
               content: stream.title,
            },
         })
      )

      const streamJobs = additionalData.livestream.jobsByLivestreamId[
         stream.id
      ].map((job) =>
         getJobEmailData(job, {
            baseUrl: host,
            livestreamId: stream.id,
            utmParams: {
               campaign: "event-followup",
               content: stream.title,
            },
         })
      )

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
            identifiers: {
               id: getAuthUidFromUserLivestreamData(streamUserData),
            },
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
                  ? (await sparkRepo.getPublishedSparksByGroupId(group.id)) ??
                    []
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

         const result = await notificationService.sendEmailNotifications(
            emailTemplates
         )

         functions.logger.info(
            `Sent followup emails for ${livestreamsToRemind.length} livestreams. Success: ${result.successful}, Failed: ${result.failed}`
         )
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
