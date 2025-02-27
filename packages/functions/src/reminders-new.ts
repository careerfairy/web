import { Group } from "@careerfairy/shared-lib/groups"
import {
   LiveStreamEventWithUsersLivestreamData,
   ReminderEmailStatus,
} from "@careerfairy/shared-lib/livestreams"
import { createCalendarEvent } from "@careerfairy/shared-lib/utils"
import { generateCalendarEventProperties } from "@careerfairy/shared-lib/utils/calendarEvents"
import {
   getHost,
   makeLivestreamEventDetailsUrl,
} from "@careerfairy/shared-lib/utils/urls"
import {
   addUtmTagsToLink,
   companyNameSlugify,
   getLivestreamICSDownloadUrl,
   makeUrls,
} from "@careerfairy/shared-lib/utils/utils"
import { FieldValue, Timestamp } from "firebase-admin/firestore"
import { error, info, log } from "firebase-functions/logger"
import { HttpsError, onRequest } from "firebase-functions/v2/https"
import { onSchedule } from "firebase-functions/v2/scheduler"
import ical from "ical-generator"
import { DateTime } from "luxon"
import { firestore } from "./api/firestoreAdmin"
import { groupRepo, notificationRepo } from "./api/repositories"
import { getStreamsByDateWithRegisteredStudents } from "./lib/livestream"
import {
   CUSTOMERIO_EMAIL_TEMPLATES,
   EmailAttachment,
   EmailNotificationRequestData,
} from "./lib/notifications/EmailTypes"
import { OnBatchCompleteCallback } from "./lib/notifications/NotificationRepository"
import { addMinutesDate, dateFormatOffset, isLocalEnvironment } from "./util"

// delay to be sure that the reminder is sent at the time
const reminderDateDelay = 20

// range to how many minutes we will search
const reminderScheduleRange = 20

type ReminderTemplates = Pick<
   typeof CUSTOMERIO_EMAIL_TEMPLATES,
   | "LIVESTREAM_REMINDER_5M"
   | "LIVESTREAM_REMINDER_1H"
   | "LIVESTREAM_REMINDER_24H"
>

type ReminderTemplateId = ReminderTemplates[keyof ReminderTemplates]

export type ReminderConfig = {
   scheduleEmailMinutesBefore: number
   templateId: ReminderTemplateId
   reminderUtmCampaign: string
}

const Reminder5Min = {
   templateId: CUSTOMERIO_EMAIL_TEMPLATES.LIVESTREAM_REMINDER_5M,
   scheduleEmailMinutesBefore: 5,
   reminderUtmCampaign: "reminder-5min",
} as const satisfies ReminderConfig

const Reminder1Hour = {
   templateId: CUSTOMERIO_EMAIL_TEMPLATES.LIVESTREAM_REMINDER_1H,
   scheduleEmailMinutesBefore: 60,
   reminderUtmCampaign: "reminder-1h",
} as const satisfies ReminderConfig

const Reminder24Hours = {
   templateId: CUSTOMERIO_EMAIL_TEMPLATES.LIVESTREAM_REMINDER_24H,
   scheduleEmailMinutesBefore: 1440,
   reminderUtmCampaign: "reminder-24h",
} as const satisfies ReminderConfig

const reminderConfigs = {
   [Reminder5Min.templateId]: Reminder5Min,
   [Reminder1Hour.templateId]: Reminder1Hour,
   [Reminder24Hours.templateId]: Reminder24Hours,
} as const

/**
 * Runs every 15 minutes and does the following:
 *  - Fetches livestreams that will start between 20 minutes from now and 40 minutes from now
 *  - Schedules emails to be sent 5 minutes before the livestream starts
 */
export const schedule5MinutesReminderEmails = onSchedule(
   {
      memory: "8GiB",
      timeoutSeconds: 540,
      schedule: "every 15 minutes",
   },
   async () => {
      log(`Current time: ${new Date().toLocaleString()}`)

      // Streams that will start between 20 minutes from now and 40 minutes from now
      const streams = await getStreams(Reminder5Min)

      await handleReminder(streams, Reminder5Min)
   }
)

/**
 * Runs every 15 minutes and does the following:
 *  - Fetches livestreams that will start between 1 hour 20 minutes from now and 1 hour 40 minutes from now
 *  - Schedules emails to be sent 1 hour before the livestream starts
 */
export const schedule1HourReminderEmails = onSchedule(
   {
      memory: "8GiB",
      timeoutSeconds: 540,
      schedule: "every 15 minutes",
   },
   async () => {
      log(`Current time: ${new Date().toLocaleString()}`)

      // Streams that will start between 1 hour 20 minutes from now and 1 hour 40 minutes from now
      const streams = await getStreams(Reminder1Hour)

      await handleReminder(streams, Reminder1Hour)
   }
)

/**
 * Runs every 15 minutes and does the following:
 *  - Fetches livestreams that will start between 1 day 20 minutes from now and 1 day 40 minutes from now
 *  - Schedules emails to be sent 1 day before the livestream starts
 */
export const schedule24HoursReminderEmails = onSchedule(
   {
      memory: "8GiB",
      timeoutSeconds: 540,
      schedule: "every 15 minutes",
   },
   async () => {
      log(`Current time: ${new Date().toLocaleString()}`)

      // Streams that will start between 1 day 20 minutes from now and 1 day 40 minutes from now
      const streams = await getStreams(Reminder24Hours)

      await handleReminder(streams, Reminder24Hours)
   }
)

const getStreams = async (reminder: ReminderConfig) => {
   const dateStart = addMinutesDate(new Date(), reminderDateDelay)

   const filterStartDate = addMinutesDate(
      dateStart,
      reminder.scheduleEmailMinutesBefore
   )

   const filterEndDate = addMinutesDate(filterStartDate, reminderScheduleRange)

   const streams = await getStreamsByDateWithRegisteredStudents(
      filterStartDate,
      filterEndDate
   )

   const numberOfStreams = streams.length

   const streamIds = streams.map((s) => s.id)

   const startDate = filterStartDate.toLocaleString()
   const endDate = filterEndDate.toLocaleString()

   if (numberOfStreams === 0) {
      log(
         `No streams found for reminder ${
            reminder.templateId
         } from ${startDate} to ${endDate} (current time: ${new Date().toLocaleString()}) skipping`
      )
      return []
   }

   log(
      `Found ${numberOfStreams} stream with ids ${streamIds.join(
         ", "
      )} that will start between ${startDate} and ${endDate} we will be sending the reminder for ${
         reminder.templateId
      }`
   )

   return streams
}

/**
 * Test the reminder by running it manually
 * must include the reminderTemplateId in the query params
 *
 * eg: {functionUrl}?reminderTemplateId=live_stream_reminder_1h
 */
export const testReminder = onRequest(
   {
      memory: "8GiB",
      timeoutSeconds: 540,
   },
   async (req, res) => {
      const reminderTemplateId = req.query
         .reminderTemplateId as ReminderTemplateId

      const reminder = reminderConfigs[reminderTemplateId]

      if (!reminder) {
         res.status(400).send(
            `Invalid query param 'reminderTemplateId'. Valid values are: ${Object.keys(
               reminderConfigs
            ).join(", ")}`
         )
         return
      }

      const streams = await getStreams(reminder)

      await handleReminder(streams, reminder)

      res.status(200).send(
         `Reminders scheduled for ${streams.length} streams for ${reminder.templateId}`
      )
   }
)

const handleReminder = async (
   streams: LiveStreamEventWithUsersLivestreamData[],
   reminder: ReminderConfig
) => {
   try {
      const allGroups = await Promise.all(
         streams.map((stream) =>
            groupRepo.getGroupsByIds(stream.groupIds).then((groups) => {
               return {
                  streamId: stream.id,
                  group: groups.find((g) => !g.universityCode) || groups[0],
               }
            })
         )
      )

      const streamGroups: Record<string, Group> = {}

      allGroups.forEach((groupData) => {
         streamGroups[groupData.streamId] = groupData.group
      })

      const emailsStatus = await handleSendEmails(
         streams,
         reminder,
         streamGroups
      )

      await updateLiveStreamsWithEmailStatus(emailsStatus)
   } catch (error) {
      log(`Error handling reminder with template ${reminder.templateId}`, error)
      throw new HttpsError("unknown", error)
   }
}

/**
 * It creates and sends email notifications based on the stream and reminder information
 * for all streams that are not FaceToFace using the NotificationRepository.
 */
const handleSendEmails = async (
   streams: LiveStreamEventWithUsersLivestreamData[],
   reminder: ReminderConfig,
   streamGroups: Record<string, Group>
): Promise<Record<string, ReminderEmailStatus>> => {
   // Track email status for each stream
   const emailStatus: Record<string, ReminderEmailStatus> = {}

   // Process each stream
   for (const stream of streams) {
      const streamGroup = streamGroups[stream.id]
      const attachments: EmailAttachment[] = []

      if (stream.isFaceToFace) {
         log(
            `Livestream ${stream.id} with ${stream.company} is F2F, no reminder email sent out`
         )
         continue
      }

      // Check if this reminder has already been sent for this stream
      if (
         stream.reminderEmailsStatus?.[reminder.templateId]?.sentAt &&
         stream.reminderEmailsStatus?.[reminder.templateId]?.status !== "failed"
      ) {
         log(
            `Reminder ${reminder.templateId} already sent for stream ${stream.id}`
         )
         continue
      }

      log(`Starting to schedule reminder emails for livestream ${stream.id}`)

      // Get all registered users for this stream
      const registeredUsers = stream.usersLivestreamData || []

      if (registeredUsers.length === 0) {
         log(`No registered users for livestream ${stream.id}, skipping`)
         continue
      }

      if (
         reminder.templateId ===
         CUSTOMERIO_EMAIL_TEMPLATES.LIVESTREAM_REMINDER_24H
      ) {
         info(`This is a ${reminder.templateId} reminder, attaching ICS file`)
         // Generate ICS file content
         const cal = ical()

         const calendarEventProperties = generateCalendarEventProperties(
            stream,
            {
               campaign: "fromcalendarevent-mail",
            }
         )

         cal.createEvent(calendarEventProperties)

         const icsContent = cal.toString()

         attachments.push({
            filename: `${stream.title.replace(/[^a-z0-9]/gi, "_")}.ics`,
            content: icsContent,
         })
      }

      const calendarEvent = createCalendarEvent(stream)

      const urls = makeUrls(calendarEvent)

      // Initialize status tracking for this stream
      emailStatus[stream.id] = {
         templateId: reminder.templateId,
         livestreamId: stream.id,
         totalRecipients: registeredUsers.length,
         successful: 0,
         failed: 0,
         status: "failed", // Initial status, will be updated after sending
         sentAt: null,
      }

      const livestreamStartDateTime = DateTime.fromJSDate(
         stream.start.toDate(),
         {
            zone: stream.timezone || "Europe/Zurich",
         }
      )

      const livestreamFormattedStartDate = dateFormatOffset(
         livestreamStartDateTime.toLocaleString(DateTime.DATETIME_FULL)
      ) // eg: "28/02/2025 10:00 (CET)"

      const upcomingStreamLink = stream.externalEventLink
         ? stream.externalEventLink
         : makeLivestreamEventDetailsUrl(stream.id)

      const companyPageUrl = streamGroup.publicProfile
         ? `${getHost()}/company/${companyNameSlugify(
              streamGroup.universityName
           )}`
         : ""

      const emailDeliveryTime = livestreamStartDateTime.minus({
         minutes: reminder.scheduleEmailMinutesBefore,
      })

      const deliveryTimeInUnix = Math.floor(emailDeliveryTime.toSeconds())

      // Create notification requests for all users
      const notificationRequests = registeredUsers.map<
         EmailNotificationRequestData<ReminderTemplateId>
      >((userLivestreamData) => ({
         templateId: reminder.templateId,
         templateData: {
            livestream: {
               company: streamGroup.universityName,
               bannerImageUrl: streamGroup.bannerImageUrl,
               companyLogoUrl: stream.companyLogoUrl,
               start: livestreamFormattedStartDate,
               title: stream.title,
               url: addUtmTagsToLink({
                  link: upcomingStreamLink,
                  source: "careerfairy",
                  medium: "email",
                  campaign: reminder.reminderUtmCampaign,
                  content: stream.title,
               }),
               companyPageUrl: companyPageUrl
                  ? addUtmTagsToLink({
                       link: companyPageUrl,
                       source: "careerfairy",
                       medium: "email",
                       campaign: reminder.reminderUtmCampaign,
                       content: stream.title,
                    })
                  : "",
            },
            calendar: {
               google: urls.google,
               apple: getLivestreamICSDownloadUrl(
                  stream.id,
                  isLocalEnvironment(),
                  {
                     utmCampaign: "fromcalendarevent-mail",
                  }
               ),
               outlook: urls.outlook,
            },
         },
         userAuthId:
            userLivestreamData.userId || userLivestreamData.user.authId,
         to: userLivestreamData.user.userEmail || userLivestreamData.id,
         attachments,
         send_at: deliveryTimeInUnix,
      }))

      // Create a progress callback for this stream
      const onBatchCompleteCallback: OnBatchCompleteCallback = (
         batchProgress
      ) => {
         // Update status as batches complete
         emailStatus[stream.id].successful = batchProgress.totalSuccessful
         emailStatus[stream.id].failed = batchProgress.totalFailed

         log(
            `Progress for ${stream.id}: ${batchProgress.totalSuccessful}/${batchProgress.totalItems} sent`
         )
      }

      // Send notifications with progress tracking
      try {
         const result = await notificationRepo.sendEmailNotifications(
            notificationRequests,
            onBatchCompleteCallback
         )

         // Update final status
         emailStatus[stream.id].successful = result.successful
         emailStatus[stream.id].failed = result.failed
         emailStatus[stream.id].status =
            result.successful === notificationRequests.length
               ? "complete"
               : result.successful > 0
               ? "partial"
               : "failed"

         log(
            `Completed scheduling ${result.successful}/${
               notificationRequests.length
            } emails for ${
               stream.id
            } current time: ${new Date().toLocaleString()}`
         )
      } catch (err) {
         error(
            `Error sending notifications for stream ${stream.id}: ${err.message}`
         )
         emailStatus[stream.id].status = "failed"
      }
   }

   // Return the status for all streams
   return emailStatus
}

/**
 * Update livestreams with email status using the new format
 */
export const updateLiveStreamsWithEmailStatus = async (
   emailStatus: Record<string, ReminderEmailStatus>
) => {
   for (const status of Object.values(emailStatus)) {
      const ref = firestore.collection("livestreams").doc(status.livestreamId)

      const toUpdate: Record<string, ReminderEmailStatus> = {
         [`reminderEmailsStatus.${status.templateId}`]: {
            ...status,
            sentAt: FieldValue.serverTimestamp() as Timestamp,
         },
      }

      await ref.update(toUpdate)
   }
}
